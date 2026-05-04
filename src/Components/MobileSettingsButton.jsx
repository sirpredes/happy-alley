export default function MobileSettingsButton({onClick}){
    return <button
        className="settings-button"
        onTouchStart={onClick}
    >
        ⚙️
    </button>
}