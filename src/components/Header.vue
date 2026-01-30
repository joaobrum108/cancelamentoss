<template>
      <v-container class="reincidencias-container" fluid>
        <div class="reincidencias-hero">
                <div 
                    class="reincidencias-logo"
                    role="img"
                    aria-label="RedFox"
                    :style="{ '--reinc-logo-url': `url(${logo})` }"
                />
                <span class="reincidencias-hero-divider" aria-hidden="true"></span>
                <div class="reincidencias-hero-text">
                    <h1 class="reincidencias-title">Cancelamentos</h1>
                    <p class="reincidencias-subtitle">
                        Monitoramento de cancelamentos em tempo real
                    </p>
                </div>
                </div>
      </v-container>
</template>
<script setup>
import logo from '../assets/logo.png'

</script>
<style scoped>

.reincidencias-container {
  flex: 1 1 auto;
  display: grid;
  grid-template-rows: auto auto 1fr;
  overflow: hidden;
  min-height: 0;
  height: 100%;
  width: 100%;
  max-width: 100%;
  padding: 0 !important;
  box-sizing: border-box;
}

.reincidencias-container > .v-card {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.reincidencias-hero {
  padding: 20px 20px 20px 72px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.reincidencias-hero-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reincidencias-hero-divider {
  width: 1px;
  height: 56px;
  margin-top: 6px;
  background: rgba(178, 34, 34, 0.25);
  align-self: flex-start;
}

.reincidencias-hero-rule {
  height: 1px;
  width: 100vw;
  margin: 4px 0 12px;
  margin-left: calc(50% - 50vw);
  background: rgba(178, 34, 34, 0.18);
}

.reincidencias-logo {
  width: 220px !important;
  height: 90px;
  flex: 0 0 auto;
  background-color: #b22222;
  -webkit-mask-image: var(--reinc-logo-url);
  mask-image: var(--reinc-logo-url);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.reincidencias-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #b22222;
  letter-spacing: -0.5px;
}

.reincidencias-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.reincidencias-hero + .filter-card {
  margin-top: 4px;
}
</style>