<template>
  <div class="flex min-h-screen relative bg-slate-50 dark:bg-slate-800">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <div :class="['pt-20 flex-1 transition-all duration-300', sidebarExpanded ? 'ml-[280px]' : 'ml-20']">
      <div class="p-8 max-w-[1800px] mx-auto w-full box-border bg-white dark:bg-slate-900">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between gap-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-8 shadow">
            <div class="flex-1 flex items-center justify-between">
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl shadow" style="background: linear-gradient(135deg,#2563eb,#60a5fa)">
                  <i class="fas fa-users"></i>
                </div>
                <div class="flex flex-col gap-2">
                  <h1 class="m-0 text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-4">Gestión de Usuarios</h1>
                  <p class="m-0 text-sm font-medium text-slate-500 dark:text-slate-300">Administra y controla el acceso de usuarios al sistema</p>
                </div>
              </div>
            </div>
            <div class="flex gap-4">
              <button
                @click="openCreateModal"
                class="inline-flex items-center gap-3 rounded-xl px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-tr from-emerald-500 to-emerald-600"
                title="Crear nuevo usuario"
              >
                <i class="fas fa-user-plus"></i>
                <span>Crear Usuario</span>
              </button>
              <button
                @click="loadUsers"
                class="inline-flex items-center gap-3 rounded-xl px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-tr from-blue-500 to-blue-700 min-h-[56px] min-w-[160px] whitespace-nowrap"
                :disabled="isLoading"
                title="Actualizar lista de usuarios"
              >
                <i class="fas fa-refresh" :class="{ 'fa-spin': isLoading }"></i>
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        <div v-if="error || success" class="mb-6">
          <div
            v-if="error"
            class="relative mb-3 flex items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200"
          >
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
            <button @click="error = null" class="absolute right-2 top-2 rounded p-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div
            v-if="success"
            class="relative mb-3 flex items-center gap-3 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200"
          >
            <i class="fas fa-check-circle"></i>
            {{ success }}
            <button @click="success = null" class="absolute right-2 top-2 rounded p-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="min-h-[400px] flex flex-col items-center justify-center text-center">
          <div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
          <p>Cargando usuarios...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="min-h-[400px] flex flex-col items-center justify-center text-center">
          <div class="flex flex-col items-center gap-4">
            <i class="fas fa-exclamation-triangle text-5xl text-red-500"></i>
            <h3 class="m-0 text-xl font-semibold">Error al cargar usuarios</h3>
            <p>{{ error }}</p>
            <button @click="loadUsers" class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">
              <i class="fas fa-redo"></i>
              Reintentar
            </button>
          </div>
        </div>

        <!-- Users List -->
        <div v-else>
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-8 max-w-full">
            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-5 shadow dark:border-slate-700 dark:bg-slate-800">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow" style="background: linear-gradient(135deg,#2563eb,#60a5fa)">
                  <i class="fas fa-users"></i>
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/60 px-3 py-2 rounded-full">
                  <i class="fas fa-chart-line"></i>
                  <span>+{{ Math.round((users.length / 100) * 10) || 0 }}%</span>
                </div>
              </div>
              <div>
                <h3 class="m-0 text-2xl font-bold bg-clip-text text-transparent" style="background-image: linear-gradient(135deg,#0f172a,#2563eb)">{{ users.length }}</h3>
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Usuarios</p>
                <div class="mt-2 inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-200/60 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-700/60 dark:text-slate-300">
                  <i class="fas fa-info-circle text-blue-500"></i>
                  <span>Usuarios registrados en el sistema</span>
                </div>
              </div>
            </div>

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-5 shadow dark:border-slate-700 dark:bg-slate-800">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow" style="background: linear-gradient(135deg,#10b981,#34d399)">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-100/70 px-3 py-2 rounded-full dark:text-emerald-300 dark:bg-emerald-900/30">
                  <i class="fas fa-arrow-up"></i>
                  <span>{{ Math.round((activeUsersCount / users.length) * 100) || 0 }}%</span>
                </div>
              </div>
              <div>
                <h3 class="m-0 text-2xl font-bold bg-clip-text text-transparent" style="background-image: linear-gradient(135deg,#0f172a,#10b981)">{{ activeUsersCount }}</h3>
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Usuarios Activos</p>
                <div class="mt-2 inline-flex items-center gap-2 rounded border border-emerald-200 bg-emerald-100/70 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200">
                  <i class="fas fa-check-circle"></i>
                  <span>Usuarios con acceso activo</span>
                </div>
              </div>
            </div>

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-5 shadow dark:border-slate-700 dark:bg-slate-800">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow" style="background: linear-gradient(135deg,#ef4444,#dc2626)">
                  <i class="fas fa-user-times"></i>
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-100/70 px-3 py-2 rounded-full dark:text-red-300 dark:bg-red-900/30">
                  <i class="fas fa-arrow-down"></i>
                  <span>{{ Math.round((inactiveUsersCount / users.length) * 100) || 0 }}%</span>
                </div>
              </div>
              <div>
                <h3 class="m-0 text-2xl font-bold bg-clip-text text-transparent" style="background-image: linear-gradient(135deg,#0f172a,#ef4444)">{{ inactiveUsersCount }}</h3>
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Usuarios Inactivos</p>
                <div class="mt-2 inline-flex items-center gap-2 rounded border border-red-200 bg-red-100/70 px-3 py-1 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200">
                  <i class="fas fa-ban"></i>
                  <span>Usuarios sin acceso</span>
                </div>
              </div>
            </div>

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-5 shadow dark:border-slate-700 dark:bg-slate-800">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow" style="background: linear-gradient(135deg,#f59e0b,#d97706)">
                  <i class="fas fa-user-shield"></i>
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/60 px-3 py-2 rounded-full">
                  <i class="fas fa-crown"></i>
                  <span>Privilegiados</span>
                </div>
              </div>
              <div>
                <h3 class="m-0 text-2xl font-bold">{{ adminUsersCount }}</h3>
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Administradores</p>
                <div class="mt-2 inline-flex items-center gap-2 rounded border border-amber-200 bg-amber-100/70 px-3 py-1 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-200">
                  <i class="fas fa-key"></i>
                  <span>Usuarios con privilegios</span>
                </div>
              </div>
            </div>

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-5 shadow dark:border-slate-700 dark:bg-slate-800">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow" style="background: linear-gradient(135deg,#8b5cf6,#7c3aed)">
                  <i class="fas fa-crown"></i>
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/60 px-3 py-2 rounded-full">
                  <i class="fas fa-star"></i>
                  <span>Máximo nivel</span>
                </div>
              </div>
              <div>
                <h3 class="m-0 text-2xl font-bold">{{ superUserCount }}</h3>
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Super Usuarios</p>
                <div class="mt-2 inline-flex items-center gap-2 rounded border border-violet-200 bg-violet-100/70 px-3 py-1 text-xs text-violet-700 dark:border-violet-900/40 dark:bg-violet-900/30 dark:text-violet-200">
                  <i class="fas fa-gem"></i>
                  <span>Acceso completo al sistema</span>
                </div>
              </div>
            </div>

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-5 shadow dark:border-slate-700 dark:bg-slate-800">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow" style="background: linear-gradient(135deg,#06b6d4,#0891b2)">
                  <i class="fas fa-user-friends"></i>
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/60 px-3 py-2 rounded-full">
                  <i class="fas fa-handshake"></i>
                  <span>Colaboradores</span>
                </div>
              </div>
              <div>
                <h3 class="m-0 text-2xl font-bold">{{ collaboratorUsersCount }}</h3>
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Colaboradores</p>
                <div class="mt-2 inline-flex items-center gap-2 rounded border border-cyan-200 bg-cyan-100/70 px-3 py-1 text-xs text-cyan-700 dark:border-cyan-900/40 dark:bg-cyan-900/30 dark:text-cyan-200">
                  <i class="fas fa-users"></i>
                  <span>Usuarios con permisos limitados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Table -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div class="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 p-6">
              <h2 class="m-0 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <i class="fas fa-list text-blue-500"></i>
                Lista de Usuarios
              </h2>
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-3">
                  <div class="relative flex items-center rounded-xl border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-2">
                    <i class="fas fa-search mx-3 text-slate-500"></i>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Buscar por nombre, email o rol..."
                      class="flex-1 bg-transparent outline-none text-[0.95rem] text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                    />
                    <button
                      v-if="searchQuery"
                      @click="clearSearch"
                      class="ml-2 grid h-8 w-8 place-items-center rounded bg-red-600 text-white hover:bg-red-700"
                      title="Limpiar búsqueda"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div v-if="searchQuery" class="inline-block rounded border border-slate-200 bg-slate-200/60 px-3 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-700/60 dark:text-slate-300">
                    <span>{{ filteredUsers.length }} resultado{{ filteredUsers.length !== 1 ? 's' : '' }} encontrado{{ filteredUsers.length !== 1 ? 's' : '' }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <label class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <i class="fas fa-filter text-blue-500 text-xs"></i>
                      Filtrar por rol:
                    </label>
                    <select
                      v-model="currentFilter"
                      @change="setFilter(currentFilter)"
                      class="min-w-[200px] rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="all">
                        Todos ({{ users.length }})
                      </option>
                      <option value="active">
                        Activos ({{ activeUsersCount }})
                      </option>
                      <option value="inactive">
                        Inactivos ({{ inactiveUsersCount }})
                      </option>
                      <option value="admin">
                        Administradores ({{ adminUsersCount }})
                      </option>
                      <option value="super_user">
                        Super Usuarios ({{ superUserCount }})
                      </option>
                      <option value="collaborator">
                        Colaboradores ({{ collaboratorUsersCount }})
                      </option>
                    </select>
                  </div>

                  <div class="flex items-center gap-2">
                    <select v-model="sortField" class="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      <option value="username">Nombre de usuario</option>
                      <option value="email">Email</option>
                      <option value="enabled">Estado</option>
                      <option value="createdAt">Fecha de creación</option>
                    </select>
                    <button
                      @click="toggleSortOrder"
                      class="grid h-10 w-10 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-900 transition hover:scale-105 hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      :title="sortOrder === 'asc' ? 'Orden ascendente' : 'Orden descendente'"
                    >
                      <i class="fas" :class="sortOrder === 'asc' ? 'fa-sort-amount-up' : 'fa-sort-amount-down'"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[1400px] border-collapse">
                <thead>
                  <tr>
                    <th class="sticky top-0 z-10 bg-slate-200/60 dark:bg-slate-700/60 text-left text-slate-900 dark:text-slate-100 font-semibold p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer select-none" @click="sortBy('username')">
                      Usuario
                      <i class="fas fa-sort ml-2 text-slate-500" :class="{ 'fa-sort-up': sortField === 'username' && sortOrder === 'asc', 'fa-sort-down': sortField === 'username' && sortOrder === 'desc' }"></i>
                    </th>
                    <th class="sticky top-0 z-10 bg-slate-200/60 dark:bg-slate-700/60 text-left text-slate-900 dark:text-slate-100 font-semibold p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer select-none" @click="sortBy('email')">
                      Email
                      <i class="fas fa-sort ml-2 text-slate-500" :class="{ 'fa-sort-up': sortField === 'email' && sortOrder === 'asc', 'fa-sort-down': sortField === 'email' && sortOrder === 'desc' }"></i>
                    </th>
                    <th class="sticky top-0 z-10 bg-slate-200/60 dark:bg-slate-700/60 text-left text-slate-900 dark:text-slate-100 font-semibold p-4 border-b border-slate-200 dark:border-slate-700">Roles</th>
                    <th class="sticky top-0 z-10 bg-slate-200/60 dark:bg-slate-700/60 text-left text-slate-900 dark:text-slate-100 font-semibold p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer select-none" @click="sortBy('enabled')">
                      Estado
                      <i class="fas fa-sort ml-2 text-slate-500" :class="{ 'fa-sort-up': sortField === 'enabled' && sortOrder === 'asc', 'fa-sort-down': sortField === 'enabled' && sortOrder === 'desc' }"></i>
                    </th>
                    <th class="sticky top-0 z-10 bg-slate-200/60 dark:bg-slate-700/60 text-left text-slate-900 dark:text-slate-100 font-semibold p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer select-none" @click="sortBy('createdAt')">
                      Fecha Creación
                      <i class="fas fa-sort ml-2 text-slate-500" :class="{ 'fa-sort-up': sortField === 'createdAt' && sortOrder === 'asc', 'fa-sort-down': sortField === 'createdAt' && sortOrder === 'desc' }"></i>
                    </th>
                    <th class="sticky top-0 z-10 bg-slate-200/60 dark:bg-slate-700/60 text-left text-slate-900 dark:text-slate-100 font-semibold p-4 border-b border-slate-200 dark:border-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-200/60 dark:hover:bg-slate-700/40">
                    <td class="p-4 align-middle">
                      <div class="flex items-center gap-4">
                        <div class="grid h-12 w-12 place-items-center rounded-full text-white text-base"
                             :class="{
                               'bg-red-500 ring-2 ring-red-300': user.roles.includes('ROLE_SUPER_USER'),
                               'bg-amber-500 ring-2 ring-amber-300': user.roles.includes('ROLE_ADMIN'),
                               'bg-emerald-500 ring-2 ring-emerald-300': user.roles.includes('ROLE_COLLABORATOR'),
                               'bg-blue-600 ring-2 ring-blue-300': !user.roles.includes('ROLE_SUPER_USER') && !user.roles.includes('ROLE_ADMIN') && !user.roles.includes('ROLE_COLLABORATOR'),
                             }">
                          <i class="fas fa-user"></i>
                        </div>
                        <div class="flex flex-col gap-1 flex-1">
                          <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ user.username }}</span>
                          <span class="text-xs font-medium text-slate-500">ID: {{ user.id }}</span>
                          <div class="mt-1 text-xs text-slate-500 flex items-center gap-1">
                            <i class="fas fa-clock text-[0.7rem]"></i>
                            {{ formatRelativeDate(user.createdAt) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="p-4 align-middle text-slate-900 dark:text-slate-100">
                      <div class="inline-flex items-center gap-3 rounded border border-slate-200 bg-slate-200/60 px-3 py-2 text-sm transition dark:border-slate-700 dark:bg-slate-700/60">
                        <i class="fas fa-envelope text-blue-500"></i>
                        <span class="font-medium">{{ user.email }}</span>
                        <button @click="copyEmail(user.email)" class="opacity-60 hover:opacity-100 rounded p-1 hover:bg-blue-600 hover:text-white">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td class="p-4 align-middle">
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="role in user.roles"
                          :key="role"
                          class="inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[0.75rem] font-semibold uppercase tracking-wide"
                          :class="{
                            'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200': role === 'ROLE_SUPER_USER',
                            'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-200': role === 'ROLE_ADMIN',
                            'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200': role === 'ROLE_COLLABORATOR',
                            'border-slate-300 bg-slate-100 text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400': role === 'ROLE_USER',
                          }"
                        >
                          <i :class="getRoleIcon(role)"></i>
                          {{ getRoleLabel(role) }}
                        </span>
                      </div>
                    </td>
                    <td class="p-4 align-middle">
                      <button
                        type="button"
                        @click="toggleUserStatus(user)"
                        class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold uppercase tracking-wide transition shadow-sm hover:scale-105 hover:shadow-md"
                        :class="user.enabled
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200'
                          : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200'"
                        :title="`Hacer clic para ${user.enabled ? 'desactivar' : 'activar'}`"
                      >
                        <i :class="user.enabled ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                        {{ user.enabled ? 'Activo' : 'Inactivo' }}
                      </button>
                    </td>
                    <td class="p-4 align-middle text-slate-900 dark:text-slate-100">
                      <div class="inline-flex items-center gap-3 rounded border border-slate-200 bg-slate-200/60 px-3 py-2 text-sm transition dark:border-slate-700 dark:bg-slate-700/60">
                        <i class="fas fa-calendar text-blue-500"></i>
                        <div class="flex flex-col gap-0.5">
                          <span class="text-sm font-medium">{{ formatDate(user.createdAt) }}</span>
                          <span class="text-xs text-slate-500">{{ formatTime(user.createdAt) }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="p-4 align-middle">
                      <div class="flex gap-2">
                        <button @click="editUser(user)" class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white hover:-translate-y-0.5">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button @click="deleteUser(user)" class="grid h-8 w-8 place-items-center rounded bg-red-600 text-white hover:-translate-y-0.5">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="filteredUsers.length === 0" class="p-12 text-center text-slate-500">
              <div class="mb-4 text-5xl text-slate-400">
                <i class="fas fa-users"></i>
              </div>
              <h3 class="m-0 text-xl font-semibold text-slate-900 dark:text-slate-100">No se encontraron usuarios</h3>
              <p v-if="searchQuery">No hay usuarios que coincidan con "{{ searchQuery }}"</p>
              <p v-else-if="currentFilter !== 'all'">No hay usuarios con el filtro seleccionado</p>
              <p v-else>No hay usuarios registrados en el sistema</p>
            </div>
          </div>
        </div>

        <!-- Edit User Modal -->
        <EditUserModal
          v-if="showEditModal"
          :user="selectedUser"
          :show="showEditModal"
          @close="closeEditModal"
          @saved="handleUserUpdated"
        />

        <!-- Delete User Modal -->
        <DeleteUserModal
          v-if="showDeleteModal"
          :user="selectedUser"
          :show="showDeleteModal"
          @close="closeDeleteModal"
          @confirmed="handleUserDeleted"
        />

        <!-- Status Change Modal -->
        <StatusChangeModal
          v-if="showStatusModal"
          :user="selectedUser"
          :show="showStatusModal"
          @close="closeStatusModal"
          @confirmed="handleStatusChanged"
        />

        <!-- Create User Modal -->
        <CreateUserModal
          v-if="showCreateModal"
          :show="showCreateModal"
          @close="closeCreateModal"
          @created="handleUserCreated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import userService from '@/services/userService'
import EditUserModal from '@/components/EditUserModal.vue'
import DeleteUserModal from '@/components/DeleteUserModal.vue'
import StatusChangeModal from '@/components/StatusChangeModal.vue'
import CreateUserModal from '@/components/CreateUserModal.vue'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'

// Reactive data
const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const currentFilter = ref('all')
const sortField = ref('username')
const sortOrder = ref('asc')
const sidebarExpanded = ref(false)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)
const selectedUser = ref(null)
const statusConfirmAction = ref('') // 'activate' o 'deactivate'

// Alert states
const success = ref(null)

// Computed properties
const activeUsersCount = computed(() => users.value.filter(user => user.enabled).length)
const inactiveUsersCount = computed(() => users.value.filter(user => !user.enabled).length)
const adminUsersCount = computed(() => users.value.filter(user => user.roles.includes('ROLE_ADMIN')).length)
const superUserCount = computed(() => users.value.filter(user => user.roles.includes('ROLE_SUPER_USER')).length)
const collaboratorUsersCount = computed(() => users.value.filter(user => user.roles.includes('ROLE_COLLABORATOR')).length)

const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.roles.some(role => role.toLowerCase().includes(query))
    )
  }

  // Apply status filter
  if (currentFilter.value === 'active') {
    filtered = filtered.filter(user => user.enabled)
  } else if (currentFilter.value === 'inactive') {
    filtered = filtered.filter(user => !user.enabled)
  } else if (currentFilter.value === 'admin') {
    filtered = filtered.filter(user => user.roles.includes('ROLE_ADMIN'))
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]

    if (sortField.value === 'createdAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

// Methods
const loadUsers = async () => {
  try {
    isLoading.value = true
    error.value = null
    console.log('👥 [USER MANAGEMENT] Cargando usuarios...')

    const usersData = await userService.getAllUsers()
    users.value = usersData

    console.log('✅ [USER MANAGEMENT] Usuarios cargados exitosamente:', usersData.length)
  } catch (err) {
    console.error('❌ [USER MANAGEMENT] Error cargando usuarios:', err)
    error.value = err.response?.data?.detail || 'Error al cargar usuarios'
  } finally {
    isLoading.value = false
  }
}

const setFilter = (filter) => {
  currentFilter.value = filter
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const clearSearch = () => {
  searchQuery.value = ''
}

const exportUsers = () => {
  console.log('📊 [USER MANAGEMENT] Exportando usuarios...')
  alert('Funcionalidad de exportación en desarrollo')
}

const editUser = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const deleteUser = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleUserCreated = () => {
  console.log('✅ [USER MANAGEMENT] Usuario creado, recargando lista...')
  loadUsers()
  success.value = 'Usuario creado exitosamente'
  closeCreateModal()
}

const toggleUserStatus = (user) => {
  console.log('🔔 [USER MANAGEMENT] toggleUserStatus llamado con:', user)

  if (!user || !user.id) {
    console.log('❌ [USER MANAGEMENT] Usuario no válido')
    return
  }

  const currentStatus = user.enabled ? 'Activo' : 'Inactivo'
  const action = currentStatus === 'Activo' ? 'deactivate' : 'activate'

  console.log('✅ [USER MANAGEMENT] Cambiando estado del usuario:', user.username, 'acción:', action)

  selectedUser.value = user
  statusConfirmAction.value = action
  showStatusModal.value = true

  console.log('✅ [USER MANAGEMENT] Modal abierto:', showStatusModal.value)
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedUser.value = null
}

const closeStatusModal = () => {
  showStatusModal.value = false
  selectedUser.value = null
  statusConfirmAction.value = ''
}

const handleUserUpdated = () => {
  console.log('✅ [USER MANAGEMENT] Usuario actualizado, recargando lista...')
  loadUsers()
  closeEditModal()
}

const handleUserDeleted = () => {
  console.log('✅ [USER MANAGEMENT] Usuario eliminado, recargando lista...')
  loadUsers()
  closeDeleteModal()
}

const handleStatusChanged = async () => {
  if (!selectedUser.value || !selectedUser.value.id) {
    return
  }

  try {
    const user = selectedUser.value
    const newStatus = statusConfirmAction.value === 'activate'

    const updateData = {
      username: user.username,
      email: user.email,
      enabled: newStatus,
      roles: user.roles
    }

    const updatedUser = await userService.updateUser(user.id, updateData)

    const index = users.value.findIndex((u) => u.id === user.id)
    if (index > -1) {
      users.value[index] = updatedUser || { ...user, enabled: newStatus }
    }

    const statusText = newStatus ? 'activado' : 'desactivado'
    success.value = `Usuario "${user.username}" ${statusText} correctamente`
    console.log(`✅ [USER MANAGEMENT] Usuario "${user.username}" ${statusText} correctamente`)

    closeStatusModal()
  } catch (err) {
    console.error('❌ [USER MANAGEMENT] Error al cambiar el estado del usuario:', err)
    error.value = 'Error al cambiar el estado del usuario'
    loadUsers()
    closeStatusModal()
  }
}

// Utility functions
const getRoleClass = (role) => {
  const roleMap = {
    'ROLE_SUPER_USER': 'super-user',
    'ROLE_ADMIN': 'admin',
    'ROLE_COLLABORATOR': 'collaborator',
    'ROLE_USER': 'user'
  }
  return roleMap[role] || 'user'
}

const getRoleIcon = (role) => {
  const iconMap = {
    'ROLE_SUPER_USER': 'fas fa-crown',
    'ROLE_ADMIN': 'fas fa-user-shield',
    'ROLE_COLLABORATOR': 'fas fa-user-group',
    'ROLE_USER': 'fas fa-user'
  }
  return iconMap[role] || 'fas fa-user'
}

const getRoleLabel = (role) => {
  const labelMap = {
    'ROLE_SUPER_USER': 'Super Usuario',
    'ROLE_ADMIN': 'Administrador',
    'ROLE_COLLABORATOR': 'Colaborador',
    'ROLE_USER': 'Usuario'
  }
  return labelMap[role] || role
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return 'Hace un momento'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

const getUserAvatarClass = (user) => {
  if (user.roles.includes('ROLE_SUPER_USER')) return 'super-user'
  if (user.roles.includes('ROLE_ADMIN')) return 'admin'
  if (user.roles.includes('ROLE_COLLABORATOR')) return 'collaborator'
  return 'user'
}

const copyEmail = async (email) => {
  try {
    await navigator.clipboard.writeText(email)
    console.log('✅ [USER MANAGEMENT] Email copiado:', email)
  } catch (error) {
    console.error('❌ [USER MANAGEMENT] Error copiando email:', error)
  }
}

const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>
