var PRODUCTION_S3_BUCKET = 'apps.npr.org'
var STAGING_S3_BUCKET = 'stage-apps.npr.org'
var PREVIEW_FACTCHECK = 'preview'
var FACTCHECKS_DIRECTORY_PREFIX = 'factchecks/'
var PREVIEW_API_ENDPOINT = "https://nfyw9sf89l.execute-api.us-east-1.amazonaws.com/Prod/publish";


function publish_() {
    // Get payload
    var ui = SpreadsheetApp.getUi();
    var props = PropertiesService.getDocumentProperties();
    var token = props.getProperty('token');
    if (!token) {
        var response = ui.alert('Authorizer Token not found, you need to set it first');
        return;
    }

    var result = ui.prompt(
        'Factcheck Slug',
        'Enter the Desired Factcheck Slug:',
        ui.ButtonSet.OK);
    var button = result.getSelectedButton();
    if (button != ui.Button.OK) {
        return;
    } else {
        var slug = result.getResponseText();
        if (!slug.length) {
            ui.alert('Error', 'A Slug is required, it can not be empty');
            return;
        }
    }

    // Add warning
    var preview_url = 'https://s3.amazonaws.com/' + STAGING_S3_BUCKET + '/';
    preview_url += FACTCHECKS_DIRECTORY_PREFIX + PREVIEW_FACTCHECK;
    preview_url += '/index.html';
    var production_url = 'https://' + PRODUCTION_S3_BUCKET + '/';
    production_url += FACTCHECKS_DIRECTORY_PREFIX + slug + '/';

    var response = ui.alert('WARNING: PUBLISH FACTCHECK TO PRODUCTION', 'This will create/overwrite the contents of:\n'+ production_url +'\n with those of:\n'+ preview_url +'\nAre you sure you know what you are doing?', ui.ButtonSet.YES_NO);
    // Process the user's response.
    if (response != ui.Button.YES) {
        return;
    }

    // Make a POST request with form data.
    var data = {
        'CURRENT_FACTCHECK': slug
    };
    var headers = {
        'AuthToken': token
    }
    // Because payload is a JavaScript object, it will be interpreted as
    // as form data. (No need to specify contentType; it will automatically
    // default to either 'application/x-www-form-urlencoded'
    // or 'multipart/form-data')
    var options = {
        'method' : 'post',
        'headers': headers,
        'muteHttpExceptions': true,
        'payload' : data
    };

    try {
        var response = UrlFetchApp.fetch(PREVIEW_API_ENDPOINT, options);
    } catch(e) {
        throw e;
    }

    var responseCode = response.getResponseCode();
    var data = JSON.parse(response.getContentText("UTF-8"));
    showPublishDialog_(responseCode, data.message, production_url);
    logActivity_(responseCode, data.message, production_url);
}

function reset_() {
    var ui = SpreadsheetApp.getUi();
    var props = PropertiesService.getDocumentProperties();
    var token = props.getProperty('token');
    if (token) {
        props.deleteProperty('token');
        var response = ui.alert('Authorizer Token deleted');
        return;
    }
}

function logActivity_(responseCode, msg, url) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var user = Session.getEffectiveUser().getEmail();
    var now = new Date();
    var ts = now.getFullYear() + '-';
    ts += ("00"+(now.getMonth()+1)).slice(-2) + '-';
    ts += ("00"+now.getDate()).slice(-2) + ' ';
    ts += ("00"+now.getHours()).slice(-2) + ':';
    ts += ("00"+now.getMinutes()).slice(-2) + ':';
    ts += ("00"+now.getSeconds()).slice(-2);
    sheet.appendRow([user, ts, responseCode, msg, url]);
}


