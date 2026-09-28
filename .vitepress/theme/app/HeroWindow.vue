<script setup>
import AppWindow from './AppWindow.vue'
import CodeView from './CodeView.vue'
import Frame from './Frame.vue'
import ServicesPanel from './ServicesPanel.vue'
import TabBar from './TabBar.vue'
import TerminalView from './TerminalView.vue'
import WorkspacesList from './WorkspacesList.vue'

const code = `class SessionsController < ApplicationController
  MAX_ATTEMPTS = 5

  def create
    user = User.find_by(email: params[:email])

    if throttled?(params[:email])
      return render json: { error: "too many attempts" }, status: :too_many_requests
    end

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to dashboard_path
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def throttled?(email)
    Rails.cache.increment("login:#{email}", 1, expires_in: 1.minute) > MAX_ATTEMPTS
  end
end`
const terminal = [
  [['api', 6], [' % ', 'fg'], ['bin/rails test test/controllers/sessions_controller_test.rb', 'fg']],
  [['Running 6 tests in a single process', 'dim']],
  [['......', 2]],
  [['Finished in 0.412s, 14.56 runs/s', 'fg']],
  [['6 runs, 11 assertions, ', 'fg'], ['0 failures', 2], [', 0 errors, 0 skips', 'fg']],
  [['api', 6], [' % ', 'fg']],
]
</script>

<template>
  <Frame :width="1440" :height="860" window>
    <AppWindow active="services" :sidebar="248" :dock="320" :bottom="200" cursor="8:54" language="Ruby">
      <template #sidebar><WorkspacesList /></template>
      <template #dock><ServicesPanel /></template>
      <TabBar nav :tabs="[
        { title: 'sessions_controller.rb', icon: 'file', active: true, dirty: true },
        { title: 'user.rb', icon: 'file' },
        { title: 'routes.rb', icon: 'file' },
      ]" :buttons="['eye', 'diff_unified', 'panel_right', 'panel_bottom', 'maximize']" />
      <CodeView :code="code" :active="8" :caret="8" :added="[2, 7, 8, 9, 21, 22, 23]" />
      <template #bottom>
        <TabBar :tabs="[{ title: 'api - zsh', icon: 'terminal', active: true }]" :buttons="['plus', 'panel_right', 'panel_bottom', 'maximize']" />
        <TerminalView :lines="terminal" />
      </template>
    </AppWindow>
  </Frame>
</template>
