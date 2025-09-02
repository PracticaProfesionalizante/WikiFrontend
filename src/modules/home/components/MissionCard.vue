<template>
  <v-card class="uiverse-pixel-card" elevation="12" shaped>
    <v-card-title class="uiverse-card-header">
      {{ title }}
    </v-card-title>

    <v-card-text class="uiverse-card-body">
      <p>{{ objective }}</p>
      <p>{{ condition }}</p>
      <p>Estado: <span class="status">{{ status }}</span></p>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "MissionCard",
  props: {
    title: {
      type: String,
      default: "NUEVA MISIÓN"
    },
    objective: {
      type: String,
      default: "Objetivo: Tener una muy buena wiki."
    },
    condition: {
      type: String,
      default: "Condicion: Estar aprendiendo en todo el proceso"
    },
    status: {
      type: String,
      default: "ESPERANDO"
    }
  }
};
</script>

<style scoped>
.uiverse-pixel-card {
  font-family: "Courier New", monospace;
  font-size: 1em;
  background: #0004ff;
  color: #fff;
  width: 22em;
  padding: 1em;
  image-rendering: pixelated;
  text-shadow: 1px 1px #000;
  transition: transform 0.2s steps(1);
}

.uiverse-pixel-card:hover {
  transform: translateY(-0.2em);
  animation: uiverse-card-glitch 0.3s steps(2) infinite;
  background: rgb(4, 19, 96);
}

.uiverse-card-header {
  font-size: 1.2em;
  border-bottom: 2px solid #000;
  padding-bottom: 0.25em;
}

.uiverse-card-body p {
  margin: 0.5em 0;
  line-height: 1.4;
}

.status {
  color: #00ff99;
  font-weight: bold;
  text-shadow: 1px 1px #000;
}

@keyframes uiverse-card-glitch {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, -1px); }
  75% { transform: translate(-1px, -1px); }
  100% { transform: translate(0, 0); }
}
</style>