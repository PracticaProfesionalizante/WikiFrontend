<template>
  <button @click="handleClick" class="mission-button">
    <span>{{ text }}</span>
  </button>
</template>

<script>
export default {
  name: "MissionButton",
  props: {
    text: {
      type: String,
      default: "INICIAR MISIÓN"
    }
  },
  emits: ['click'],
  methods: {
    handleClick() {
      this.$emit('click');
    }
  }
};
</script>

<style scoped>
.mission-button {
  display: inline-block;
  width: 200px;
  height: 50px;
  border-radius: 10px;
  border: 1px solid #03045e;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease-in;
  z-index: 1;
  margin-top: 2rem;
  background: transparent;
  cursor: pointer;
}

.mission-button::before,
.mission-button::after {
  content: '';
  position: absolute;
  top: 0;
  width: 0;
  height: 100%;
  transform: skew(15deg);
  transition: all 0.5s;
  overflow: hidden;
  z-index: -1;
}

.mission-button::before {
  left: -10px;
  background: #0e19e8;
}

.mission-button::after {
  right: -10px;
  background: #0e0570;
}

.mission-button:hover::before,
.mission-button:hover::after {
  width: 58%;
}

.mission-button:hover span {
  color: #ffffff;
  transition: 0.3s;
}

.mission-button span {
  color: #4f32f2;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease-in;
  font-family: "Courier New", monospace;
}
</style>