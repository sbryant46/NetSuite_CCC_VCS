/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/https','N/file','/SuiteScripts/Libs/multiPartUpload'],

    /**
     * @param {https} https
     * @param {file} file
     * @param {multi} multiPartUpload
     */
    function(https,file,multi) {
        const LIB_VERSION = "1.0.0";
        var PERMISSION_URL = "https://www.googleapis.com/drive/v3/files/{{fileId}}/permissions";
        var TEAMDRIVE_URL  = "https://www.googleapis.com/drive/v3/teamdrives";
        var FILELIST_URL   = "https://www.googleapis.com/drive/v3/files";
        var FILEUPLOAD_MULTI = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsTeamDrives=true";
        var FILEUPLOAD_MEDIA = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media&supportsTeamDrives=true";
        var FILE_EXPORT = "https://www.googleapis.com/drive/v3/files/{{fileId}}/export";
        var API_KEY = "AIzaSyBZX4v5QE1_WvbHl28GRHLqeLvtAvN5-aI";


        var refresh_token = "1/LXwxqwFmMWeoAlDTsVme1KWC7ebsx8ExPv6yNthtLBk";
        // from the API console
        var client_id = "538675275673-gsciabdbrjnnibn3mvhd27psuugilmir.apps.googleusercontent.com";
        // from the API console
        var client_secret = "ddDekMnSyx3ws5qwYve0L5Mv";
        // from https://developers.google.com/identity/protocols/OAuth2WebServer#offline
        var refresh_url = "https://www.googleapis.com/oauth2/v4/token";

        var SCOPES = 'https://www.googleapis.com/auth.drive';
        var FOLDER_MIME = 'application/vnd.google-apps.folder';
        var SHEETS_MIME = 'application/vnd.google-apps.spreadsheet';
        var TRANSMITTAL_FOLDER_ID ="1seeTogXs1zb_3drqs_Uqc2LZ9aecV9aH" ; //"0AE-T1hEMLKFeUk9PVA" /*TD TransmittalExport */
        var TRANSMITTAL_FOLDER_ID_TD = "0AP7XHqxSj7e8Uk9PVA";
        var NS_FILECAB_ID = "0AMC_s9XVNmzRUk9PVA"; /* TD - NS_FILECAB  */
        var _access_token = { auth_code: "", expires: new Date() };
        var folderMap = {};

        function access_token(){
            var atoken = _access_token;
            if(atoken.auth_code!="" && atoken.expires<= new Date()){
                //log.debug("Using Existing Token!");
                return atoken.auth_code;
            }
            /* get a new token */
            var post_body = "grant_type=refresh_token&client_id=" + encodeURIComponent(client_id) + "&client_secret=" + encodeURIComponent(client_secret) + "&refresh_token=" + encodeURIComponent(refresh_token) ;
            //the NS way...
            var resp;
            resp = https.post({
                url : refresh_url,
                body: post_body,
                headers : { 'Content-Type': 'application/x-www-form-urlencoded'}
            });

            var oToken = JSON.parse(resp.body);
            _access_token.auth_code = oToken.access_token;
            var d2;
            d2 = new Date();
            d2.setHours(d2.getHours()+1);

            _access_token.expired = d2;

            //_access_token.expired.setHours(_access_token.expired.setHours.getHours() + 1);
            return _access_token.auth_code;
        }
        /**
         *  @param {oUpData} | {id}  - Required can be an object holding config or simple file cabinet id
         */
        /**
         * @param {oFile} - NS file cabinet object
         * @param {oMetaData} - dDrive meta data
         * REMOVED: @param {path} - string for gDrive Path..assume root of TransmittalExport  i.e  "KOR"
         * @param {permission} - supports assigning permission to user
         *
         *    permission can be a simple email address OR
         *      a bodyParams object   OR
         *      an object holding with qp and bp (queryParams & bodyParams)
         *      i.e ...   "jim.thompson@cru.org"   (simple eamil)
         *      bodyParams  { emailAddress: "jim.thompson@cru.org", role : "writer", type: "group"}
         *      both qp & bp { qp : {emailMessage:"Please edit this file"},
         *                     bp : {emailAddress: "jim.thompson@cru.org"}
         *                     }
         */
        //CSV Support (also in ccc_utilities causing execution count exceeded error I think)
        function arrayToCSVString(oData, fnRowMap) {

            return arrayToString(oData, ',', '\n', fnRowMap, '"');
        }
        function arrayToString(oData, cColDelim, cRowDelim, fnRowMap, cTextDelim) {
            cTextDelim = cTextDelim || "";
            var cData = "";
            fnRowMap = fnRowMap || function (item) {
                var cLine = "";
                var pCcnt = 0;
                if (typeof item === "string") {
                    item = JSON.parse(item);
                }
                //log.debug("CSV Values",Object.keys(item));

                for (prop in item) {
                    var value = item[prop];
                    try
                    {
                        value = value.toString();
                    }
                    catch (ee) {
                        value = "";
                    }

                    if (!value || value === null) {
                        value = '';
                    }
                    if (typeof value === "string") {
                        value = value.trim();
                    }
                    if (cTextDelim != "") {
                        value = cTextDelim + value + cTextDelim;
                    }
                    else {
                        //No TextDelim...therefore remove field delim from field value
                        value = value.replace(/\,/g, '');
                    }

                    //log.debug(prop,value);
                    //cLine += (pCcnt>0 ? cColDelim : '') + (item[prop]=== null ? '' : item[prop].toString().replace(cColDelim,''));
                    cLine += (pCcnt > 0 ? cColDelim : '') + value; //(item[prop]=== null ? '' : item[prop].toString().replace(cColDelim,''));
                    pCcnt++;

                }
                //log.debug("CSV Line",cLine);
                cLine += cRowDelim;
                return cLine;
            }
            var SingleLine = oData.map(fnRowMap);
            var ColHead = "";
            var oFirst = oData[0];
            if (typeof oFirst === "string") {
                oFirst = JSON.parse(oFirst);
            }
            ColHead = Object.keys(oFirst).join(',');

            //var cCnt = 0;
            //for(prop in oData[0]){
            //	ColHead += (cCnt>0 ? cColDelim : '') + prop ;
            //	cCnt++;
            //}
            ColHead += cRowDelim;
            return ColHead + SingleLine.join('');
        }
        // dStamp must be an actual date object!!
        // Change dStamp to "full file name"
        function uploadArrayAsCSVFile(theDataIn, baseFileName, parentId, nMaxCells,cFullFileName) {
            //2M cell limitation..change for testing
            parentId = parentId || TRANSMITTAL_FOLDER_ID;
            var MAX_CELLS = 1999900;
            nMaxCells = nMaxCells || MAX_CELLS;


            var aRet = [];
            if (theDataIn.length === 0) {
                oBod = {};
                oBod.kind = "error";
                oBod.error = "No Data!";
                aRet.push(oBod);
                return aRet;
            }
            var theData = theDataIn;
            var nCellsPerLine = -1;
            log.debug("DATA LINE 0", theDataIn[0]);
            log.debug("TYPE OF LINE 0", typeof theDataIn[0]);
            var checkOBJ;
            if (typeof theDataIn[0] === "string") {
                try {
                    checkOBJ = JSON.parse(theDataIn[0]);
                    //context.values is an array of JSON strings...convert to objects
                    theData = theDataIn.map(function (e) {
                        return JSON.parse(e);
                    });
                }
                catch (ee) {
                    checkOBJ = { testProp: "singleStringArray" };
                }
            }
            else {
                checkOBJ = theDataIn[0];
            }
            for (p in checkOBJ) {
                nCellsPerLine++;
            }
            log.debug("Cells Per Line: " + nCellsPerLine);

            var nLinesToUpload = parseInt(nMaxCells / nCellsPerLine);
            log.debug("Max Line Count: " + nLinesToUpload);

            var aFList = [];
            if (theData.length <= nLinesToUpload) {
                //Upload them ALL
                aFList.push(theData);
            }
            else
            {
                while (theData.length)
                {
                    aFList.push(theData.splice(0, nLinesToUpload));
                }
            }

            log.debug("File Group Cnt: " + aFList.length);
            for (var dGroup = 0; dGroup < aFList.length; dGroup++) {
                theData = aFList[dGroup];
                var cCSVText = arrayToCSVString(theData);
                var bid = "NotSet";
                try {
                    bid = JSON.parse(theData[0]).ExportBatch;
                }
                catch (e) {
                    //Error ;
                }

                var fileName;
                //JT: 12/10/2018 - Added ability to pass in target date for date stamp
                // dStamp must be an actual date object!!
                //var nd1 = new Date();
                var nd = new Date();
                var dParts = nd.toISOString().substring(0, 10).split("-");


                var prefix = "";

                fileName = prefix + baseFileName + '_' + dParts[0] + "_" + dParts[1] + "_" + dParts[2] + "_GRP_" + dGroup + ".csv";
                //Support full name being passed in.
                var theFinalFile;
                if (cFullFileName) {
                    var theGrp = "_GRP_" + dGroup;
                    theFinalFile = cFullFileName.replace("{GRP}",theGrp);
                }
                fileName = theFinalFile || fileName;

                log.debug("FileName(nd)", fileName);
                log.debug("File Size", cCSVText.length);

                var shareEmail;
                try {
                    /* Something here to get the correct share email  */
                    //shareEmail = "randy.mcdowell@cru.org,timothy.bantola@cru.org";
                    //shareEmail = "jimt@theAppdepot.com";

                }
                catch (e) {

                }
                //log.debug("Data Len: ",cCSVText.length);
                var googleFile, perm_Params;
                var msg;
                msg = "Your NetSuite transmittal data export is ready.";

                perm_Params = { qp: {}, bp: {} };
                //perm_Params.bp.emialAddress = shareEmail;
                perm_Params.qp.emailMessage = msg;

                //---------------------------------------------------
                //TODO: Configure Notification/permissions if needed.
                // The current plan is to allow the memberships/share
                // settings in google drive handle this part. However,
                // if that changes, use the fUpConfig parameter below
                // to set permissions and such on the uploaded file.
                //----------------------------------------------------
                var fUpConfig = {};
                fUpConfig.name = fileName;
                fUpConfig.parents = [parentId]; //Must be passed in!
                googleFile = uploadGfile(cCSVText, fUpConfig);
                var oBod;
                try {
                    oBod = JSON.parse(googleFile.body);
                }
                catch (e) {
                    oBod = {};
                    oBod.kind = "error";
                    oBod.error = e;
                }
                aRet.push(oBod);
            } //End of For Loop

            return aRet;
        }

        function uploadGfile(oFile,oMetaData,permission)
        {
            var drive_url = FILEUPLOAD_MULTI;
            var fileContents = "";
            var path="";
            var response;
            oMetaData = oMetaData || {};
            oMetaData.parents = oMetaData.parents ||  [TRANSMITTAL_FOLDER_ID];

            if(multi.isFile(oFile))
            {
                fileContents = oFile.getContents();
                oMetaData.mimeType = multi.getContentType(oFile);
                oMetaData.name = oFile.name;
            }
            else
            {
                fileContents =oFile ; /* Must be a string that is the file data */
            }
            oMetaData.name = oMetaData.name || "NS File - " + new Date();
            oMetaData.mimeType = oMetaData.mimeType || "application/vnd.google-apps.spreadsheet";
            oMetaData.title = oMetaData.title || oMetaData.name ;
            var token = access_token();
            var boundary = '__*lksjdflkjsdfkdsj1232123uewirieDJSka';
            var headers= {
                'Authorization' : 'Bearer '+ token,
                'Content-Type' : 'multipart/form-data; boundary=' + boundary
            };

            // Body
            var body = [];
            body.push('--'+ boundary);
            body.push('Content-Disposition: form-data; name="jsondata"');
            body.push('Content-Type: application/json');
            body.push('');
            body.push(JSON.stringify(oMetaData));
            if(fileContents.length>0){
                body.push('--'+ boundary);
                body.push('Content-Disposition: form-data; name="MyFile.csv"');
                body.push('Content-Type: '+oMetaData.mimeType);
                body.push('');
                body.push(fileContents);
            }
            body.push('--' + boundary + '--');
            body.push('');
            // Submit Request
            try
            {
                response = https.post({
                    url: drive_url,
                    headers: headers,
                    body: body.join('\r\n')
                });
                /* try to log results  for debugging */
                try
                {
                    //log.debug(JSON.parse(response.body));
                }
                catch(eee)
                {

                }
                if(permission)
                {
                    /* Permission PASSED  */
                    try
                    {
                        var theFile = JSON.parse(response.body);
                        //function setFilePermission(fileId,queryParams,bodyParams){
                        var fId = theFile.id;
                        var qp ;
                        var bp ;
                        /* Support passing full queryParams and bodyParams */
                        if(permission.qp)
                        {
                            qp = permission.qp;
                        }
                        if(permission.bp)
                        {
                            bp = permission.bp;
                        }
                        //-----------------------------------------------------
                        if(qp===undefined && bp===undefined)
                        {
                            /* full queryParams or bodyParams NOT passed */
                            if(permission.emailAddress)
                            {
                                /* support an entire bodyParam object being passed */
                                bp = permission;
                            }
                            else
                            {
                                /* suupport a simple email address being passed */
                                bp = {};
                                bp.emailAddress = permission;
                            }
                        }
                        if(bp.emailAddress)
                        {
                            //Assigning to someone....
                            response = setFilePermission(fId,qp,bp);
                        }
                    }
                    catch(e1)
                    {

                    }
                }
                else
                {
                    /*No permission passed */
                    return response;

                }
            }
            catch (e) {
                log.error({ title: 'Failed to submit file', details: (e.message || e.toString()) + (e.getStackTrace ? (' \n \n' + e.getStackTrace().join(' \n')) : '') });
            }

        }
        //--------------------------------------------------------------------
        function object2qs(urlParams){
            var qs = Object.keys(urlParams).map(function(p) {
                return [encodeURIComponent(p), encodeURIComponent(urlParams[p])].join("=");
            }).join("&");
            return qs;
        }
        function createFolder(folderName,parentId)
        {
            parentId = parentId || TRANSMITTAL_FOLDER_ID;
            var oMd = {};
            oMd.parents = [parentId];
            oMd.name = folderName;
            oMd.mimeType = "application/vnd.google-apps.folder";
            log.audit("Creating GDrive Folder", oMd.name);
            return uploadGfile("",oMd);
        }
        function getMimeType(cFileName){
            var m = "plain/text";
            var aExt = cFileName.split(".");
            if(aExt.length>0){
                var ext = aExt[aExt.length-1].toUpperCase();
                switch(ext){
                    case "CSV":
                    case "XLS":
                    case "XLSX":
                        m = "text/csv"
                        break;
                    case "DOC":
                    case "DOCX":
                        m = "application/msword";
                        break;
                    case "HTML":
                    case "HTM":
                        m ="text/html";
                        break;
                    case "JS":
                        m="text/javascript";
                        break;
                }

            }
            return m;
        }
        function getGFile(cFileName,mimeType,rootParentId){
            var str = "";
            var fId;
            fId = getGFileId(cFileName, rootParentId);
            if (fId) {
                //var shareURL = "https://www.googleapis.com/drive/v3/files/" + fId + "?alt=media";
                var shareURL = FILE_EXPORT;
                shareURL = shareURL.replace("{{fileId}}",fId);
                if(!mimeType){
                    mimeType=getMimeType(cFileName);
                }
                shareURL+="?mimeType="+encodeURIComponent(mimeType);
                //log.audit("DL URL", shareURL);
                var resp;
                log.debug("shareURL",shareURL);
                resp = https.get({
                    url: shareURL,
                    headers: {
                        'Content-Type': "text/plain",
                        'Authorization': "Bearer " + access_token()
                    }
                });
                try {
                    log.debug("resp.body",resp.body);
                    str = resp.body;

                }
                catch (eee) {
                    //Do nothing ;
                }

            }

            return str;
        }
        function getGFileAsString(cFileName, rootParentId) {
            var str = "";
            var fId;
            fId = getGFileId(cFileName, rootParentId);
            if (fId) {
                //var shareURL = "https://www.googleapis.com/drive/v3/files/" + fId + "?alt=media";
                var shareURL = FILE_EXPORT;
                shareURL = shareURL.replace("{{fileid}}",fId);
                //mimeType =
                //log.audit("DL URL", shareURL);
                var resp;
                resp = https.get({
                    url: shareURL,
                    headers: {
                        'Content-Type': 'plain/text',
                        'Authorization': "Bearer " + access_token()
                    }
                });
                try {
                    //log.debug(resp.body);
                    str = resp.body;

                }
                catch (eee) {
                    //Do nothing ;
                }

            }
            //Strip out NON-PLAIN TEXT CHARACTERS!!
            str = str.replace(/[^ -~]+/g, "");
            return str;
        }
        function getGFileInfo(cFileName, rootParentId, lCaseSensitive) {
            var Path, cFName;
            var aPaths = cFileName.split("/");
            cFName = aPaths.pop();
            Path = aPaths.join("/");
            //log.error("Path", Path);
            //log.error("Fname", cFName);

            rootParentId = rootParentId || NS_FILECAB_ID;
            var targetParentId;
            if (!Path) {
                targetParentId = rootParentId;
            } else {
                targetParentId = getFolderId(Path, rootParentId, true);
            }
            //-----------------------------------------------------------
            var query = 'trashed = false';
            query += ' and "' + targetParentId + '" in parents'; // To exclude folders
            var isTeamDrive = false;

            if (rootParentId == TRANSMITTAL_FOLDER_ID_TD || rootParentId == NS_FILECAB_ID) {
                isTeamDrive = true;
            }
            var files, pageToken;
            var allFiles = [];
            var cfig = {};
            if (isTeamDrive) {
                cfig = {
                    q: query,
                    maxResults: 100,
                    // required for team drive queries
                    corpora: 'teamDrive',
                    supportsTeamDrives: true,
                    teamDriveId: rootParentId,
                    includeTeamDriveItems: true
                }
            }
            else {
                cfig = {
                    q: query,
                    maxResults: 100,
                    // required for team drive queries
                    corpora: 'user',
                    supportsTeamDrives: true,
                    //teamDriveId: teamDriveId,
                    includeTeamDriveItems: true

                }
            }
            allFiles = getFilelist(cfig);
            var fInfo;
            try {
                if (lCaseSensitive) {
                    fInfo = allFiles.filter(function (e) { return e.name === cFName; })[0];

                } else {
                    fInfo = allFiles.filter(function (e) { return e.name.toLowerCase() === cFName.toLowerCase(); })[0];
                }
            }
            catch (fidEE) {
                // do nothing
            }
            return fInfo;


            //----------------------------------------------------------

        }
        function getGFileId(cFileName, rootParentId, lCaseSensitive) {
            var fInfo;
            fInfo = getGFileInfo(cFileName, rootParentId, lCaseSensitive);
            fInfo = fInfo || {};
            return fInfo.id;
            //----------------------------------------------------------
        }
        /*
         * File List
         */
        function getFilelist(params){
            var aRet = [];
            var pageToken;
            params.pageToken = params.pageToken || pageToken;
            var qs = object2qs(params);
            var url = FILELIST_URL +"?"+qs;
            var resp;
            var aList =[];
            var oRet ;
            do {
                if(pageToken){
                    params.pageToken =  pageToken;
                }
                else {
                    delete params.pageToken;
                }

                //delete params.pageToken;
                qs = object2qs(params);
                url = FILELIST_URL +"?"+qs;
                resp = https.get({
                    url : url,
                    headers : { 'Content-Type': 'application/json',
                        'Authorization' : "Bearer " + access_token()
                    }
                });
                try {
                    //log.debug(resp.body);
                    oRet = JSON.parse(resp.body);
                    if(oRet.files && oRet.files.length>0){
                        for(var i=0;i<oRet.files.length;i++){
                            var oFile = oRet.files[i];
                            aRet.push( oFile);
                        }
                    }
                }
                catch(ee){
                    oRet = {};
                }
                pageToken = oRet.nextPageToken;
            } while (pageToken);


            return aRet;
        }
        /*
         * Folder Manipulation
         *  List Folders => folders[{name:"myfolder",id: "kjdfklsjfkkdj"}]
         */
        function getFolderId(path,rootParentId,lNoCreate){
            rootParentId = rootParentId ||  TRANSMITTAL_FOLDER_ID ;
            //log.debug("Getting Folder Id","path="+path+"/rootId="+rootParentId);

            var currentParentId = rootParentId;
            var Paths = path.split("/");
            for(var _x=0;_x<Paths.length;_x++){
                var FolderName = Paths[_x];
                var isSF = isSubFolder(FolderName,currentParentId);
                if(isSF.isSubFolder){
                    //Folder Exists..don't create it
                }
                else
                {
                    //Folder DNE...create it!!
                    if (!lNoCreate) {
                        var newF = createFolder(FolderName, currentParentId);
                        var oNewF = JSON.parse(newF.body);
                        isSF.folderId = oNewF.id;
                    }
                    else {
                        isSF.folderId = null;
                    }
                }
                currentParentId  =  isSF.folderId;
            }
            return currentParentId;
        }
        function isSubFolder(folderName,parentId){
            parentId = parentId  || TRANSMITTAL_FOLDER_ID ;
            var aSubs = getSubFolders(parentId)
            var subFolder = { isSubFolder: false,folderId: ""}
            for(var i=0;i<aSubs.length;i++){
                if(aSubs[i].name.toUpperCase()==folderName.toUpperCase()){
                    subFolder.isSubFolder = true;
                    subFolder.folderId = aSubs[i].id;
                    return subFolder;
                }
            }
            return subFolder;
        }
        function getTeamDrive(driveName){
            var aDList=[];
            aDList = getTeamDriveList();
            var aTheDrive = [];
            var theDrive = {
                name: driveName,
                id: ""
            }
            aTheDrive = aDList.filter(function(e){ return e.name.toLowerCase() == driveName.toLowerCase()});
            if(aTheDrive.length>0){
                /* The drive was found 	 */
                theDrive = aTheDrive[0];
                theDrive.kind = "drive#teamDrive";
            }
            else
            {
                /* Drive needs to be created */
                theDrive = createTeamDrive(driveName);
            }
            return theDrive;
        }

        function createTeamDrive(driveName){
            var bodyParams = { name : driveName};
            var qp = {requestId : getUID()};
            var token = access_token();
            var headers= {
                'Authorization' : 'Bearer '+ token,
                'Content-Type' : 'application/json'
            };
            var url = TEAMDRIVE_URL;
            url +="?"+object2qs(qp);
            var req = {};

            req.headers = headers;
            req.url = url;
            req.body = JSON.stringify(bodyParams);

            var resp = https.post(req);
            var oResp ;
            try {
                oResp = JSON.parse(resp.body);
            } catch(e){
                oResp = e;
                oResp.kind = "error";
            }
            return oResp
        }
        function getTeamDriveList(dName){
            var token = access_token();
            var headers ;
            headers = {'Authorization' : 'Bearer '+ token}

            var aDrives = [];
            var pageToken=null;
            var qp = {};
            qp.pageSize = 100;
            //-----------------------------------------------------
            //Does not work like this because google user account
            // does not have admin rights ...
            //-----------------------------------------------------
            /*
            if(dName){
                qp.q = "name contains '"+dName.replace("'","\\'")+"'";
                qp.useDomainAdminAccess = true;
            }
            */
            do
            {
                var url = TEAMDRIVE_URL;
                url +="?"+object2qs(qp);
                var req = {};

                req.headers = headers;
                req.url = url;
                var resp;
                resp = https.get(req);
                var oResp ;
                try {
                    oResp = JSON.parse(resp.body);
                    //log.debug(resp.body);
                    var theseDrives=[];
                    theseDrives = oResp.teamDrives.map(function(e){return { id : e.id,name : e.name }});
                    if(dName){
                        theseDrives= theseDrives.filter(function(e){return e.name.indexOf(dName)>-1});
                    }
                    aDrives.push.apply(aDrives,theseDrives);
                }
                catch(e){
                    oResp = { nextPageToken: null,error: e}
                }
                pageToken = oResp.nextPageToken;

            }while(pageToken !=null);

            return aDrives;

        }
        function getSubFolders(teamDriveId1,isTeamDrive){
            var teamDriveId;
            if(teamDriveId1.id)
            {
                teamDriveId = teamDriveId1.id;
            }
            else
            {
                teamDriveId = teamDriveId1;
            }
            isTeamDrive = isTeamDrive || false;
            if(teamDriveId==TRANSMITTAL_FOLDER_ID_TD  || teamDriveId==NS_FILECAB_ID){
                isTeamDrive = true;
            }
            var pageToken;
            var folders ;
            var query = 'trashed = false and ' + //to exclude trashed files
                ' mimeType = "application/vnd.google-apps.folder"' ;
            if(teamDriveId!=""){
                query +=   ' and "'+teamDriveId+'" in parents'; // To exclude folders
            }

            var files, pageToken;
            var allFiles = [];
            var cfig = {};
            if(isTeamDrive){
                cfig = {
                    q: query,
                    maxResults: 100,
                    // required for team drive queries
                    corpora: 'teamDrive',
                    supportsTeamDrives: true,
                    teamDriveId: teamDriveId,
                    includeTeamDriveItems: true
                }
            }
            else {
                cfig = {
                    q: query,
                    maxResults: 100,
                    // required for team drive queries
                    corpora: 'user',
                    supportsTeamDrives: true,
                    //teamDriveId: teamDriveId,
                    includeTeamDriveItems: true

                }
            }
            allFiles = getFilelist(cfig);
            return allFiles;
        }
        function uploadStringAsTXTFile(theDataIn, cFullFileName,parentId) {
            parentId = parentId || NS_FILECAB_ID;
            uploadStringAsFile(theDataIn, cFullFileName, parentId, "text/plain", "txt");
            //var oMD = {};
            //var title = cFullFileName;
            //if (cFullFileName.indexOf(".") == -1) {
            //    cFullName += ".txt";
            //}
            //oMD.parents = [parentId];
            //oMD.mimeType = "text/plain";
            //oMD.name = cFullFileName;
            //oMD.title = cFullFileName.substring(0, cFullFileName.indexOf("."));
            //uploadGfile(theDataIn, oMD);
        }
        function uploadStringAsFile(theDataIn, cFullFileName, parentId,mimeType,ext) {
            parentId = parentId || NS_FILECAB_ID;
            var oMD = {};
            //var title = cFullFileName;
            if (cFullFileName.indexOf(".") == -1) {
                cFullName += "." + ext;
            }

            oMD.parents = [parentId];
            oMD.mimeType = mimeType;
            oMD.name = cFullFileName;
            oMD.title = cFullFileName.substring(0, cFullFileName.indexOf("."));
            uploadGfile(theDataIn, oMD);
        }

        /*--------------------------------------------
         *  Share this file with someone!!!
         *
         */
        function setFilePermission(fileId1,queryParams,bodyParams,emailList){
            var fileId;
            if(fileId1.id){
                fileId = fileId1.id;
            }else {
                fileId = fileId1;
            }

            queryParams = queryParams || {};
            bodyParams = bodyParams || {};

            var defEmail;
            var aEmails = [];
            if(emailList){
                aEmails = emailList.split(",");
            }
            else {
                aEmails[0] = bodyParams.emailAddress || "jimt@theAppDepot.com";
            }

            queryParams.supportsTeamDrives = queryParams.supportsTeamDrives ||  true;
            queryParams.transferOwnership  = queryParams.transferOwnership || false;
            queryParams.useDomainAdminAccess = queryParams.useDomainAdminAccess || false;


            bodyParams.role = bodyParams.role || "writer";
            bodyParams.type = bodyParams.type || "user";
            bodyParams.emailAddress = bodyParams.emailAddress || aEmails[0];


            var url = PERMISSION_URL.replace("{{fileId}}",fileId);
            url +="?"+object2qs(queryParams);

            var token = access_token();

            var resp;
            for(var i=0;i<aEmails.length;i++){
                bodyParams.emailAddress = aEmails[i];
                var bodyStr = JSON.stringify(bodyParams);

                var headers= {
                    'Authorization' : 'Bearer '+ token,
                    'Content-Type' : 'application/json',
                    'Content-Length' : bodyStr.length
                };

                resp = https.post({
                    url: url,
                    headers: headers,
                    body : bodyStr
                });
            }
            return resp;

        }
        function getUID() {
            var d = new Date().getTime();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
                d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }
        function getTeamDriveRoot(companyid){
            var IDList  = {};
            var p = {};
            IDList["3540813"] = {
                "id": "1jDwo3Mpxt-MZs034TtJ06gjN4cOJkDK4",
                "path": "PROD"
            };
            IDList["3540813_SB1"] = {
                "id": "1acO9LQhI2rh2pCt-tY6yXbWZfmx4GQgH",
                "path": "SB1"
            };
            IDList["3540813_SB2"] = {
                "id": "1pLa-JnIeMbEPuzzxieNMsknfV7oyk3Wr",
                "path": "SB2"
            };
            IDList["3540813_SB3"] = {
                "id": "1JVYoxiXx1VHlNh8kZ4ckOXc7VMdaHPOn",
                "path": "SB3"
            };
            IDList["3540813_SB4"] = { "id": "15s7tgJn6XRssNGF09koBwZTNMVXC9nPb", "path": "SB4" }
            IDList["3540813_SB5"] = { "id": "1NCuJ5S9HwvigFhx4zlODUcVzgCIXmyaD", "path": "SB5" }
            p.gDriveId = IDList[companyid].id;
            p.gDrivePath=IDList[companyid].path;
            return p;
        }
        return {
            getTeamDriveRoot: getTeamDriveRoot,
            getGFile: getGFile,
            getGFileAsString: getGFileAsString,
            uploadStringAsFile: uploadStringAsFile,
            uploadStringAsTXTFile: uploadStringAsTXTFile,
            uploadArrayAsCSVFile: uploadArrayAsCSVFile,
            getUID : getUID,
            access_token : access_token,
            createFolder : createFolder,
            uploadGfile : uploadGfile,
            getSubFolders : getSubFolders,
            getFilelist : getFilelist,
            getFolderId: getFolderId,
            getGFileId: getGFileId,
            setFilePermission : setFilePermission,
            getTeamDriveList : getTeamDriveList,
            getTeamDrive : getTeamDrive,
            createTeamDrive : createTeamDrive,
            version : function(){return LIB_VERSION;}
        };

    });