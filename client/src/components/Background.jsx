import "../index.css";

export default function Background() {
    return (
        <div className="bg-wrapper">
            <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
                <circle cx="200" cy="200" r="180" fill="#E6F4FF" />
                <circle cx="1200" cy="150" r="220" fill="#FFF1CC" />
                <circle cx="1000" cy="650" r="260" fill="#E9FFF3" />
                <circle cx="300" cy="700" r="240" fill="#FFEAF1" />
            </svg>
        </div>
    );
}