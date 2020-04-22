'use babel';

import { CompositeDisposable } from 'atom';
const _ = require('lodash');

function _lookAround(selection, editor){
  const {start, end} = selection.getBufferRange()
  const regWordConn = /[\w_\-]/
  for (var i = end.column; i < 80; i++) {
    if (!regWordConn.test(editor.getTextInBufferRange({start: {row: end.row, column: i}, end: {row: end.row, column: (i + 1)}}))) {
      break;
    }
  }
  for (var j = start.column; j > 0; j--) {
    if (!regWordConn.test(editor.getTextInBufferRange({start: {row: start.row, column: j - 1}, end: {row: start.row, column: j}}))) {
      break;
    }
  }
  selection.setBufferRange({start: {row: start.row, column: j}, end: {row: end.row, column: i}})
}

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'convert-term-case:convert': () => this.convert()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  convert() {
        const editor = atom.workspace.getActiveTextEditor()
        if (editor) {
            const selection = editor.getSelectedText()
            if (selection) {
                let converted = selection
                if (converted.indexOf('-') >= 0) {
                    converted = _.snakeCase(converted)
                } else if (converted.indexOf('_') >= 0) {
                    converted = _.startCase(converted)
                } else if (converted.indexOf(' ') >= 0) {
                    converted = _.camelCase(converted)
                } else {
                    converted = _.kebabCase(converted)
                }
                editor.insertText(converted, {
                  select: true
                })
            }else {//try to set selection
              const sels = editor.selections
              sels.forEach((sel) => {
                sel.selectWord()
                _lookAround(sel, editor)
              })
            }
        }
    }

};
