import { useProgress } from "@react-three/drei"

export const LoadingScreen = ({ started, onStarted }) => {
    const {progress, active} = useProgress()
    console.log(progress)
    return <div className={`loading-screen ${started ? "loading-screen--started" : ""}`}>
        <div className="loading-screen_board">
            <h1 className="loading-screen_title">Take a breath and </h1>
            <button
                className="loading-screen_button"
                disabled={active}
                onClick={onStarted}
            >
                Start
            </button>
        </div>
    </div>
}
