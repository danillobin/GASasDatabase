class GappsDapi{constructor(e=""){this.base=this.getBase(e)||this.createBase(e)}createBase(e){let t,o={method:"POST",contentType:"application/json",payload:JSON.stringify({mimeType:"application/vnd.google-apps.folder",name:e}),headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};try{t=JSON.parse(UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/",o).getContentText())}catch(e){console.log(e),t=null}return t}getBase(e){const t=`https://www.googleapis.com/drive/v3/files/?q=name='${e}' and trashed=false and mimeType = 'application/vnd.google-apps.folder'`,o={method:"GET",headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};let r;try{r=JSON.parse(UrlFetchApp.fetch(t,o).getContentText()).files[0]}catch(e){console.log(e),r=null}return r}deleteBase(e=this.base.id){const t=`https://www.googleapis.com/drive/v3/files/${e}`,o={method:"DELETE",headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};let r;try{r=UrlFetchApp.fetch(t,o).getContentText()}catch(e){console.log(e),r=null}}findPosts(e=[],t=20){let o="";return e.forEach((function(t,r){let a="";a+=`fullText contains '%22${function(e){let t="";return Object.entries(e).forEach((([e,o])=>t+=`${e}:${o}`)),t}(t)}%22'`,e.length>1?o+=r+1!=e.length?`(${a}) or `:`(${a})`:o=a})),o=`and (${o})`,this.getPosts(t,o)}getPosts(e=20,t=""){const o=`https://www.googleapis.com/drive/v3/files/?pageSize=${e}&${t?"":"orderBy=createdTime desc&"}q='${this.base.id}' in parents and trashed%3Dfalse ${t}`,r={method:"GET",headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};let a;try{a=JSON.parse(UrlFetchApp.fetch(o,r).getContentText()).files}catch(e){console.log(e),a=null}return a}getPostById(e){const t=`https://www.googleapis.com/drive/v3/files/${e}?fields=*`,o={method:"GET",headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};let r;try{r=JSON.parse(UrlFetchApp.fetch(t,o).getContentText())}catch(e){console.log(e),r=null}return r}getValuePosts(e){let t={};return e.forEach((function(e){const o=`https://www.googleapis.com/drive/v3/files/${e}?alt=media`,r={method:"GET",headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};try{const a=UrlFetchApp.fetch(o,r).getContentText();t[e]=JSON.parse(a)}catch{}})),t}createPost(e=""){const t=Utilities.base64Encode((new Date).valueOf())+(o=1e5,r=999999,o=Math.ceil(o),r=Math.floor(r),Math.floor(Math.random()*(r-o))+o);var o,r;const a={contentType:"application/json",method:"POST",payload:JSON.stringify({mimeType:"text/plain",parents:[this.base.id],name:t}),headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};let n;try{return n=JSON.parse(UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/",a).getContentText()),e?this.editPost(n.id,e):n}catch{}}deletePost(e){const t=`https://www.googleapis.com/drive/v3/files/${e}`,o={method:"DELETE",headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};let r;try{r=UrlFetchApp.fetch(t,o).getResponseCode()}catch(e){console.log(e),r=null}return r}editPost(e,t=""){const o=`https://www.googleapis.com/upload/drive/v3/files/${e}`,r={method:"PATCH",contentType:"text/plain",payload:JSON.stringify(t),headers:{Authorization:`Bearer ${ScriptApp.getOAuthToken()}`}};let a;try{a=JSON.parse(UrlFetchApp.fetch(o,r).getContentText())}catch(e){console.log(e),a=null}return a}}function init(e){return new GappsDapi(e)}
