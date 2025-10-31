<template>
  <transition name="halloween-fade">
    <div v-if="showOverlay" class="halloween-overlay pointer-events-none">
      <div class="overlay-backdrop"></div>
      <div class="overlay-flash"></div>

      <div class="moon"></div>

      <div class="bat bat-1">
        <span></span><span></span><span></span>
      </div>
      <div class="bat bat-2">
        <span></span><span></span><span></span>
      </div>
      <div class="bat bat-3">
        <span></span><span></span><span></span>
      </div>

      <div class="ghost">
        <div class="ghost-eyes"></div>
        <div class="ghost-mouth"></div>
        <div class="ghost-tail"><span></span></div>
      </div>

      <div class="pumpkin">
        <div class="pumpkin-eye pumpkin-eye-left"></div>
        <div class="pumpkin-eye pumpkin-eye-right"></div>
        <div class="pumpkin-mouth"></div>
        <div class="pumpkin-glow"></div>
      </div>

      <p class="message">Noche de Halloween</p>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDarkMode } = useTheme()

const showOverlay = ref(false)
let scareTimer = null

const isHalloweenSeason = computed(() => {
  const now = new Date()
  return now.getMonth() === 9 // October (0-indexed)
})

const triggerOverlay = () => {
  if (!isHalloweenSeason.value) {
    return
  }

  if (showOverlay.value && scareTimer) {
    clearTimeout(scareTimer)
  }

  showOverlay.value = true

  scareTimer = setTimeout(() => {
    showOverlay.value = false
  }, 5200)
}

watch(
  () => isDarkMode.value,
  (isDark, wasDark) => {
    if (isDark && !wasDark) {
      triggerOverlay()
    }
  }
)

onMounted(() => {
  if (isDarkMode.value) {
    triggerOverlay()
  }
})

onBeforeUnmount(() => {
  if (scareTimer) {
    clearTimeout(scareTimer)
  }
})
</script>

<style scoped>
.halloween-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.overlay-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(255, 120, 0, 0.35), transparent 55%),
    radial-gradient(circle at 20% 80%, rgba(255, 80, 0, 0.3), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(150, 0, 0, 0.35), transparent 55%),
    rgba(0, 0, 0, 0.78);
  animation: backdrop-pulse 6s ease-in-out infinite alternate;
}

.overlay-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0;
  animation: overlay-flash 1.4s ease-out 0.2s forwards;
}

.moon {
  position: absolute;
  top: 10%;
  right: 12%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffffff, #ffe4b5 60%, rgba(0, 0, 0, 0.15) 100%);
  box-shadow: 0 0 40px rgba(255, 200, 120, 0.35);
  animation: moon-flicker 5s ease-in-out infinite;
}

.bat {
  position: absolute;
  width: 80px;
  height: 40px;
  transform-origin: center;
}

.bat span {
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, #1a1a1a, #050505 65%);
  border-radius: 50% 50% 10% 10%;
}

.bat span:nth-child(2),
.bat span:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 10px;
  background: radial-gradient(circle at 30% 30%, #111, #020202 70%);
}

.bat span:nth-child(2) {
  left: -30px;
  border-radius: 50% 50% 10% 60%;
}

.bat span:nth-child(3) {
  right: -30px;
  border-radius: 50% 50% 60% 10%;
}

.bat-1 {
  top: 20%;
  left: -10%;
  animation: bat-flight-1 8s linear infinite;
}

.bat-2 {
  top: 35%;
  left: 110%;
  transform: scale(0.8);
  animation: bat-flight-2 9s linear infinite;
  animation-delay: 1s;
}

.bat-3 {
  top: 60%;
  left: -15%;
  transform: scale(0.6);
  animation: bat-flight-3 7s linear infinite;
  animation-delay: 0.6s;
}

.ghost {
  position: absolute;
  left: 15%;
  bottom: 12%;
  width: 160px;
  height: 200px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(150, 150, 150, 0.15));
  border-radius: 80% 80% 40% 40%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  transform-origin: center;
  animation: ghost-float 5s ease-in-out infinite;
}

.ghost-eyes,
.ghost-mouth {
  position: absolute;
  background: #0f172a;
}

.ghost-eyes {
  top: 70px;
  left: 40px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-shadow: 56px 0 0 0 #0f172a;
}

.ghost-mouth {
  top: 110px;
  left: 58px;
  width: 44px;
  height: 28px;
  border-radius: 0 0 40% 40%;
  transform: rotate(180deg);
}

.ghost-tail {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -45px;
  height: 50px;
  background: transparent;
  display: flex;
  justify-content: space-between;
  padding: 0 18px;
}

.ghost-tail::before,
.ghost-tail::after,
.ghost-tail span {
  content: '';
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.ghost-tail::after {
  transform: translateY(16px);
}

.ghost-tail span {
  transform: translateY(8px);
}

.pumpkin {
  position: absolute;
  right: 18%;
  bottom: 10%;
  width: 180px;
  height: 140px;
  border-radius: 50% 50% 45% 45%;
  background: linear-gradient(90deg, #4c1d95, #fb923c 30%, #f97316 70%, #4c1d95);
  box-shadow: 0 0 30px rgba(255, 90, 0, 0.45);
  animation: pumpkin-bounce 4s ease-in-out infinite;
}

.pumpkin::after {
  content: '';
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 40px;
  border-radius: 60% 60% 30% 30%;
  background: linear-gradient(180deg, #14532d, #064e3b);
}

.pumpkin-eye {
  position: absolute;
  top: 40px;
  width: 36px;
  height: 36px;
  background: #0f172a;
  transform: rotate(25deg);
  border-radius: 30% 70% 10% 70%;
}

.pumpkin-eye-left {
  left: 40px;
}

.pumpkin-eye-right {
  right: 40px;
  transform: rotate(-25deg);
}

.pumpkin-mouth {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 24px;
  background: #0f172a;
  border-radius: 50% 50% 90% 90%;
  box-shadow: inset 0 -6px 0 rgba(255, 180, 0, 0.4);
}

.pumpkin-glow {
  position: absolute;
  inset: 12px 16px;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255, 200, 0, 0.35), rgba(255, 100, 0, 0));
  mix-blend-mode: screen;
  animation: pumpkin-glow 1.8s ease-in-out infinite alternate;
}

.message {
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 212, 128, 0.9);
  text-shadow: 0 0 12px rgba(255, 128, 0, 0.8), 0 0 24px rgba(255, 64, 0, 0.6);
  animation: text-flicker 2.5s ease-in-out infinite;
}

.halloween-fade-enter-active,
.halloween-fade-leave-active {
  transition: opacity 0.6s ease;
}

.halloween-fade-enter-from,
.halloween-fade-leave-to {
  opacity: 0;
}

@keyframes backdrop-pulse {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes overlay-flash {
  0% {
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  20% {
    opacity: 0.35;
  }
  100% {
    opacity: 0;
  }
}

@keyframes moon-flicker {
  0%,
  100% {
    filter: drop-shadow(0 0 18px rgba(255, 180, 80, 0.4));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 28px rgba(255, 220, 140, 0.7));
    transform: scale(1.03);
  }
}

@keyframes bat-flight-1 {
  0% {
    transform: translateX(0) translateY(0) scale(1);
  }
  50% {
    transform: translateX(120vw) translateY(-40px) scale(1.05);
  }
  100% {
    transform: translateX(240vw) translateY(0) scale(1);
  }
}

@keyframes bat-flight-2 {
  0% {
    transform: translateX(0) translateY(0) scale(0.85) rotate(6deg);
  }
  40% {
    transform: translateX(-120vw) translateY(-60px) scale(0.9) rotate(-6deg);
  }
  100% {
    transform: translateX(-240vw) translateY(20px) scale(0.8) rotate(6deg);
  }
}

@keyframes bat-flight-3 {
  0% {
    transform: translateX(0) translateY(0) scale(0.65) rotate(-10deg);
  }
  55% {
    transform: translateX(140vw) translateY(30px) scale(0.7) rotate(10deg);
  }
  100% {
    transform: translateX(260vw) translateY(-10px) scale(0.65) rotate(-10deg);
  }
}

@keyframes ghost-float {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.02);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes pumpkin-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.03);
  }
}

@keyframes pumpkin-glow {
  0% {
    opacity: 0.35;
  }
  100% {
    opacity: 0.75;
  }
}

@keyframes text-flicker {
  0%,
  100% {
    opacity: 0.8;
  }
  45% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  55% {
    opacity: 1;
  }
  70% {
    opacity: 0.6;
  }
}
</style>

