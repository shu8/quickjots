<script lang="ts">
	import { ui, helpPanelOpen } from '$lib/stores';

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			ui.toggleHelpPanel();
		}
	}

	function handleOverlayClick(event: MouseEvent | KeyboardEvent) {
		if (event.target === event.currentTarget) {
			ui.toggleHelpPanel();
		}
	}
</script>

<div class="help-panel" class:open={$helpPanelOpen}>
	<div
		class="help-panel-overlay"
		role="button"
		tabindex="0"
		aria-label="Close help panel"
		on:click={handleOverlayClick}
		on:keydown={handleKeyDown}
	></div>

	<div class="help-panel-content">
		<div class="help-panel-header">
			<h2>Help & Features</h2>
			<button class="help-panel-close" on:click={ui.toggleHelpPanel} aria-label="Close help"
				>×</button
			>
		</div>

		<div class="help-panel-body">
			<section class="help-section">
				<h3>Getting Started</h3>
				<p>
					Welcome to QuickJots! Start typing in the main editor to create your first note.
					Everything is saved automatically as you type.
				</p>
			</section>

			<section class="help-section">
				<h3>Managing Notes</h3>
				<ul class="help-list">
					<li><strong>Create:</strong> Click "New Note" or start typing</li>
					<li><strong>Switch:</strong> Click any note in the list below</li>
					<li><strong>Auto-save:</strong> Notes save automatically as you type</li>
					<li><strong>Titles:</strong> Generated from your note content</li>
				</ul>
			</section>

			<section class="help-section">
				<h3>Key Features</h3>
				<div class="feature-grid">
					<div class="feature-item">
						<strong>Auto-save</strong>
						<p>Your notes are saved automatically - no need to manually save.</p>
					</div>
					<div class="feature-item">
						<strong>Offline Ready</strong>
						<p>Works completely offline - no internet connection required.</p>
					</div>
					<div class="feature-item">
						<strong>Privacy First</strong>
						<p>All notes stay on your device. Nothing is sent to any server.</p>
					</div>
					<div class="feature-item">
						<strong>Dark Mode</strong>
						<p>Toggle dark mode using the moon icon in the header.</p>
					</div>
					<div class="feature-item">
						<strong>No Registration</strong>
						<p>Start using immediately - no account or signup required.</p>
					</div>
					<div class="feature-item">
						<strong>Multiple Notes</strong>
						<p>Create and organize multiple notes, sorted by most recent.</p>
					</div>
				</div>
			</section>

			<section class="help-section">
				<h3>Keyboard Shortcuts</h3>
				<div class="shortcuts">
					<div class="shortcut">
						<kbd>Ctrl</kbd> + <kbd>N</kbd> <span>New note</span>
					</div>
					<div class="shortcut">
						<kbd>Ctrl</kbd> + <kbd>S</kbd> <span>Save current note</span>
					</div>
					<div class="shortcut">
						<kbd>Ctrl</kbd> + <kbd>D</kbd> <span>Toggle dark mode</span>
					</div>
				</div>
			</section>
		</div>

		<div class="help-panel-footer">
			<p>
				Created by <a href="https://sjain.dev" target="_blank" rel="noopener">Shubham Jain</a> •
				<a href="https://github.com/shu8/quickjots" target="_blank" rel="noopener"
					>Open Source on GitHub</a
				>
				•
				<a href="mailto:shubham@quickjots.app" target="_blank" rel="noopener">Contact</a>
			</p>
		</div>
	</div>
</div>

<svelte:window on:keydown={handleKeyDown} />

<style>
	.help-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		z-index: 2000;
		pointer-events: none;
		transition: all 0.3s ease;
		opacity: 0;
	}

	.help-panel.open {
		pointer-events: all;
		opacity: 1;
	}

	.help-panel-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.help-panel.open .help-panel-overlay {
		opacity: 1;
	}

	.help-panel-content {
		position: absolute;
		top: 0;
		right: 0;
		width: 400px;
		height: 100%;
		background-color: #ffffff;
		box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
		transform: translateX(100%);
		transition: transform 0.3s ease;
		display: flex;
		flex-direction: column;
	}

	.help-panel.open .help-panel-content {
		transform: translateX(0);
	}

	.help-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		border-bottom: 1px solid #e0e0e0;
		background-color: #f8f9fa;
	}

	.help-panel-header h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
		color: #333333;
	}

	.help-panel-close {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #666666;
		padding: 4px 8px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.help-panel-close:hover {
		background-color: #e9ecef;
	}

	.help-panel-body {
		flex: 1;
		overflow-y: auto;
		padding: 0;
	}

	.help-section {
		padding: 20px;
		border-bottom: 1px solid #f0f0f0;
	}

	.help-section:last-child {
		border-bottom: none;
	}

	.help-section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: #333333;
	}

	.help-section p {
		margin: 0 0 12px 0;
		line-height: 1.5;
		color: #555555;
	}

	.help-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.help-list li {
		padding: 8px 0;
		color: #555555;
		line-height: 1.4;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.feature-item {
		padding: 12px;
		background-color: #f8f9fa;
		border-radius: 6px;
	}

	.feature-item strong {
		display: block;
		margin-bottom: 4px;
		color: #333333;
		font-size: 14px;
	}

	.feature-item p {
		margin: 0;
		font-size: 13px;
		color: #666666;
		line-height: 1.4;
	}

	.shortcuts {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.shortcut {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 0;
	}

	.shortcut kbd {
		background-color: #f1f3f4;
		border: 1px solid #dadce0;
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 12px;
		font-family: monospace;
		color: #333333;
	}

	.shortcut span {
		color: #555555;
		font-size: 14px;
	}

	.help-panel-footer {
		position: sticky;
		background-color: #f8f9fa;
		margin: 0;
		text-align: center;
		padding: 20px;
		border-bottom: 1px solid #e0e0e0;
		background-color: #f8f9fa;
	}

	.help-panel-footer p {
		font-size: 12px;
		color: #666666;
		margin: 0;
	}

	.help-panel-footer a {
		color: #007bff;
		text-decoration: none;
	}

	.help-panel-footer a:hover {
		text-decoration: underline;
	}

	/* Dark mode for help panel */
	:global(body.dark) .help-panel-content {
		background-color: #2d2d2d;
		box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
	}

	:global(body.dark) .help-panel-header {
		background-color: #3a3a3a;
		border-bottom-color: #404040;
	}

	:global(body.dark) .help-panel-header h2 {
		color: #e0e0e0;
	}

	:global(body.dark) .help-panel-close {
		color: #aaaaaa;
	}

	:global(body.dark) .help-panel-close:hover {
		background-color: #4a4a4a;
	}

	:global(body.dark) .help-section {
		border-bottom-color: #404040;
	}

	:global(body.dark) .help-section h3 {
		color: #e0e0e0;
	}

	:global(body.dark) .help-section p {
		color: #cccccc;
	}

	:global(body.dark) .help-list li {
		color: #cccccc;
	}

	:global(body.dark) .feature-item {
		background-color: #3a3a3a;
	}

	:global(body.dark) .feature-item strong {
		color: #e0e0e0;
	}

	:global(body.dark) .feature-item p {
		color: #aaaaaa;
	}

	:global(body.dark) .shortcut kbd {
		background-color: #4a4a4a;
		border-color: #555555;
		color: #e0e0e0;
	}

	:global(body.dark) .shortcut span {
		color: #cccccc;
	}

	:global(body.dark) .help-panel-footer {
		background-color: #3a3a3a;
	}

	:global(body.dark) .help-panel-footer p {
		color: #aaaaaa;
	}

	:global(body.dark) .help-panel-footer a {
		color: #64b5f6;
	}

	/* Mobile responsive for help panel */
	@media (max-width: 768px) {
		.help-panel-content {
			width: 100%;
			max-width: 400px;
		}

		.feature-grid {
			grid-template-columns: 1fr;
		}

		.shortcuts {
			gap: 6px;
		}

		.shortcut {
			gap: 8px;
		}
	}
</style>
