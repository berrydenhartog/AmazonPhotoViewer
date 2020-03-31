<template>
  <div id="app">
    <nav class="navbar" role="navigation">
      <div class="navbar-brand">
        <div class="navbar-item">
          PhotoViewer
        </div>
      </div>
    
      <div class="navbar-menu">
        <div class="navbar-start">
        </div>
    
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-light" href="/">
                Log out
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <section class="hero is-primary">
        <router-view/>
    </section>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>PhotoViewer</strong> by Berry.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>