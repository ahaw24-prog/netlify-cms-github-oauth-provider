const REQUIRED_ORIGIN_PATTERN = 
  /^((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,})(\,((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,}))*$/

if (!process.env.ORIGINS.match(REQUIRED_ORIGIN_PATTERN)) {
  throw new Error('process.env.ORIGINS MUST be comma separated list \
    of origins that login can succeed on.')
}

module.exports = (oauthProvider, message, content) => `
<script>
(function() {
  var target = window.opener || (window.parent !== window ? window.parent : null);
  if (target) {
    console.log("Sending token to main window...");
    target.postMessage(
      'authorization:${oauthProvider}:${message}:${JSON.stringify(content)}',
      '*'
    );
    setTimeout(function() {
      window.close();
    }, 300);
  } else {
    console.error("No opener window found.");
  }
})()
</script>`
