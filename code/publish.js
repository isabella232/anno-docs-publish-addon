/**
 * Opens a dialog in the document containing the add-on's user interface.
 */
function showPublishDialog_(responseCode, msg, url) {
    var ui = SpreadsheetApp.getUi();
    var doc = HtmlService.createTemplateFromFile('publish_dialog');
    doc.responseCode = responseCode;
    doc.msg = msg;
    doc.url = url;
    html = doc.evaluate();
    html.setHeight(250);
    ui.showModalDialog(html, 'Execution Result');
}
