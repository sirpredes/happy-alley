import { useEffect, useRef } from 'react'

export default function AudioManager({
	start,
	settings,
	isMoving,
	buttonPressed,
	settingsOpen
}){
	const windRef = useRef(null)
	const stepsRef = useRef([])
	const clickRef = useRef([])

	const getRandom = (array) => {
		if (!array || array.length === 0) return null
		return array[Math.floor(Math.random() * array.length)]
	}

	/**
	 * Initialize audio
	 */
	useEffect(() => {
		if (!start) return

		//Wind
		windRef.current = new Audio('/sounds/sonido brisa.mp3')
		windRef.current.loop = true
		const target = (settings.ambientVolume / 100) * (settingsOpen ? 0.2 : 1)
		windRef.current.volume = 0
		fadeAudio(windRef.current, target, 2000)

		//Steps
		stepsRef.current = Array.from({ length: 17 }, (_, i) => {
		const audio = new Audio(`/sounds/pisadas/paso ${i + 1}.mp3`)
		audio.volume = settings.masterVolume / 100
		return audio
		})

		//Clicks
		clickRef.current = Array.from({ length: 9 }, (_, i) => {
		const audio = new Audio(`/sounds/clicks/click ${i + 1}.mp3`)
		audio.volume = settings.masterVolume / 100
		return audio
		})

		//wind start
		windRef.current.play().catch(() => {})

	}, [start])

	/**
	 * Volume update (Sliders + open settings)
	 */
	useEffect(() => {
		if (!windRef.current) return

		//Wind 
		windRef.current.volume = (settings.ambientVolume / 100) * (settingsOpen ? 0.5 : 1)

		//Steps
		if (stepsRef.current.length > 0) {
			stepsRef.current.forEach(a => {
				a.volume = settings.masterVolume / 100
			})
		}

		//Clicks
		if (clickRef.current.length > 0) {
			clickRef.current.forEach(a => {
				a.volume = settings.masterVolume / 100
			})
		}

	}, [settings, settingsOpen])

	/**
	 * Steps play + randomization
	 */
	useEffect(() => {
		if (!stepsRef.current || stepsRef.current.length === 0) return

		let interval

		if (isMoving) {
			interval = setInterval(() => {
				const sound = getRandom(stepsRef.current)
				if (!sound) return

				sound.playbackRate = 0.9 + Math.random() * 0.2
				sound.currentTime = 0
				sound.play().catch(() => {})
			}, 400)
		}

		return () => clearInterval(interval)
	}, [isMoving])

	/**
	 * Open/Close settings audio
	 */
	useEffect(() => {
		if (!clickRef.current || clickRef.current.length === 0) return

		const sound = getRandom(clickRef.current)
		if (!sound) return

		sound.playbackRate = 0.9 + Math.random() * 0.2
		sound.currentTime = 0
		sound.play().catch(() => {})

	}, [settingsOpen, buttonPressed])

	return null
}

/**
 * Audio fader (wind loop start)
 */
const fadeAudio = (audio, targetVolume, duration = 2000) => {
	if (!audio) return

	const startVolume = audio.volume
	const startTime = performance.now()

	const step = (now) => {
		const progress = Math.min((now - startTime) / duration, 1)

		audio.volume = startVolume + (targetVolume - startVolume) * progress

		if (progress < 1) {
			requestAnimationFrame(step)
		}
	}

	requestAnimationFrame(step)
}