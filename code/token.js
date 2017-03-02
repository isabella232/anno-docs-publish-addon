/**
 * Opens a dialog in the document containing the add-on's user interface.
 */
function showTokenDialog_() {
    var ui = SpreadsheetApp.getUi();
    var doc = HtmlService.createTemplateFromFile('token_dialog');
    doc.token = getToken_();
    html = doc.evaluate();
    html.setHeight(400);
    ui.showModalDialog(html, 'Authorizer Token Dialog');
}

function getToken_() {
    var props = PropertiesService.getDocumentProperties();
    var token = props.getProperty('token');
    if (token) {
        return true;
    }
    return null;
}

function tokenProperty(token) {
    // Get DocumentProperties
    try {
        var props = PropertiesService.getDocumentProperties();
        props.setProperty('token', token);
        return true;
    } catch(e) {
        throw e;
        return false;
    }
}
