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
  var targetWindow = window.opener || (window.parent !== window ? window.parent : null);

  if (targetWindow) {
    console.log("Posting token directly to main window...");
    targetWindow.postMessage(
      'authorization:${oauthProvider}:${message}:${JSON.stringify(content)}',
      '*'
    );
    setTimeout(function() {
      window.close();
    }, 200);
  } else {
    console.warn("No opener found, redirecting directly to admin panel...");
    window.location.href = "https://www.skolsimmarna.se/admin/#access_token=${content.token}&token_type=bearer";
  }
})()
</script>`
