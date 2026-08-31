const REQUIRED_ORIGIN_PATTERN = 
  /^((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,})(\,((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,}))*$/

if (!process.env.ORIGINS.match(REQUIRED_ORIGIN_PATTERN)) {
  throw new Error('process.env.ORIGINS MUST be comma separated list \
    of origins that login can succeed on.')
}
const origins = process.env.ORIGINS.split(',')

module.exports = (oauthProvider, message, content) => `
<script>
(function() {
  function contains(arr, elem) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].indexOf('*') >= 0) {
        const regex = new RegExp(arr[i].replaceAll('.', '\\\\.').replaceAll('*', '[\\\\w_-]+'))
        if (elem.match(regex) !== null) {
          return true;
        }
      } else {
        if (arr[i] === elem) {
          return true;
        }
      }
    }
    return false;
  }

  var targetWindow = window.opener || (window.parent !== window ? window.parent : null);

  function recieveMessage(e) {
    console.log("recieveMessage %o", e)
    if (!contains(${JSON.stringify(origins)}, e.origin.replace('https://', 'http://').replace('http://', ''))) {
      console.log('Invalid origin: %s', e.origin);
      return;
    }
    if (targetWindow) {
      targetWindow.postMessage(
        'authorization:${oauthProvider}:${message}:${JSON.stringify(content)}',
        '*'
      );
      setTimeout(function() {
        window.close();
      }, 300);
    }
  }

  window.addEventListener("message", recieveMessage, false);
  console.log("Sending initial handshake message: %o", "${oauthProvider}");
  if (targetWindow) {
    targetWindow.postMessage("authorizing:${oauthProvider}", "*");
  }
})()
</script>`
