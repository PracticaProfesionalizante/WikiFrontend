<template>
  <v-container fluid class="d-flex flex-column align-center justify-center full-height">
    <MissionCard 
      :status="status"
      title="NUEVA MISIÓN"
      objective="Objetivo: Tener una muy buena wiki."
      condition="Condicion: Estar aprendiendo en todo el proceso"
    />
    
    <MissionButton 
      text="INICIAR MISIÓN"
      @click="startMission"
    />
  </v-container>
</template>

<script>
import MissionCard from '../components/MissionCard.vue';
import MissionButton from '../components/MissionButton.vue';

export default {
  name: "HomeProject",
  components: {
    MissionCard,
    MissionButton
  },
  data() {
    return {
      status: "ESPERANDO..."
    };
  },
  methods: {
    startMission() {
      this.status = "EMPEZADO!";
    }
  }
};
</script>

<style scoped>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.full-height {
  height: 100vh;
  min-height: 100vh;
}
</style>