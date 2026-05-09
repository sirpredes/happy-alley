import { useState, useEffect } from 'react'

const tabs = ['Sound', 'Image', 'Credits']

export default function SettingsMenu({
    settings,
    setSettings,
    buttonPressed, 
    setButtonPressed,
    onClose
}){
	const [activeTab, setActiveTab] = useState('Sound')

	/**
	 * Local storage
	 */
	//Save current settings
	useEffect(() => {
		localStorage.setItem("settings", JSON.stringify(settings))
	}, [settings])

	//Update settings
	const updateSetting = (key, value) => {
		setSettings((prev) => ({
			...prev,
			[key]: value
		}))
		setButtonPressed(!buttonPressed)
	}

	/**
	 * Settings UI updaters
	 */

	//From storage to sliders
	useEffect(() => {
		document.querySelectorAll('input[type="range"]').forEach((el) => {
			el.style.setProperty('--progress', `${el.value}%`)
		})
	}, [settings])

	const updateSliderProgress = (e) => {
		const value = e.target.value
		e.target.style.setProperty('--progress', `${value}%`)
		setButtonPressed(!buttonPressed)
	}


	const getProgress = (value, min = 0, max = 100) => {
		return ((value - min) / (max - min)) * 100
	}

	return (
		<div className="settings-overlay">
			<div className="settings-panel">

				{/* HEADER */}
				<div className="settings-header">
					<h2>Settings</h2>

					<button
						className="close-button"
						onClick={onClose}
					>
						✕
					</button>
				</div>

				{/* TABS */}
				<div className="settings-tabs">
					{tabs.map((tab) => (
						<button
							key={tab}
							className={`tab-button ${
								activeTab === tab ? 'active' : ''
							}`}
							onClick={() => {
								setActiveTab(tab)
								setButtonPressed(!buttonPressed)
							}}
						>
							{tab}
						</button>
					))}
				</div>

				{/* CONTENT */}
				<div className="settings-content">
					{activeTab === 'Sound' && (
						<>
							<SettingRow
								label="Master Volume"
								control={
									<input
										type="range"
										min="0"
										max="100"
										value={settings.masterVolume}
										onChange={(e) => {
											updateSliderProgress(e)

											setSettings((prev) => ({
												...prev,
												masterVolume: Number(e.target.value)
											}))
										}}
										style={{
											'--progress': `${getProgress(settings.masterVolume)}%`
										}}
									/>
								}
							/>

							<SettingRow
								label="Ambient Volume"
								control={
									<input
										type="range"
										min="0"
										max="100"
										value={settings.ambientVolume}
										onChange={(e) => {
											updateSliderProgress(e)

											setSettings((prev) => ({
												...prev,
												ambientVolume: Number(e.target.value)
											}))
										}}
										style={{
											'--progress': `${getProgress(settings.ambientVolume)}%`
										}}
									/>
								}
							/>
						</>
					)}

					{activeTab === 'Image' && (
						<>
							<SettingRow
								label="Smooth Edges"
								control={
									<label className="toggle-switch">
										<input
											type="checkbox"
											checked={settings.smoothEdges}
											onChange={(e) =>
												updateSetting("smoothEdges", e.target.checked)
											}
										/>
										<span className="toggle-slider"></span>
									</label>
								}
							/>
						</>
					)}

					{activeTab === 'Credits' && (
						<div className="credits-content">
							<p>Happy Alley</p>
							<p>Created with React Three Fiber / Drei</p>
							<p>Assets:</p>
							<ul>
								<li>Tree model: "Willow" (https://skfb.ly/ouFOJ) by evolveduk is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).</li>
								<li>Wind sound: wind medium brisk breeze through stiff dry corn stalks or grass sharp whistle.flac by kyles -- https://freesound.org/s/454364/ -- License: Creative Commons 0</li>
								<li>Steps sounds: Steps on dry grass by colloyilett -- https://freesound.org/s/726887/ -- License: Creative Commons 0</li>
								<li>Buttons sounds: Mechanical Buttons (DaVinci Resolve Advanced Panel) by PixelProphecy -- https://freesound.org/s/497026/ -- License: Attribution 4.0</li>
								<li>Sound edition: Lucía García Valiente</li>
							</ul>
							<p>Special thanks to: </p>
							<ul>
								<li>Bruno Simon (Three.js Journey)</li>
								<li>Simondev</li>
							</ul>
							<p>Art Direction / Development by Antonio Paredes Casasnovas</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

function SettingRow({ label, control }) {
	return (
		<div className="setting-row">
			<span>{label}</span>
			<div>{control}</div>
		</div>
	)
}