export interface ProgressBarProps {
    readonly max: number;
    readonly actual: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ max, actual }) => {
    return (
        <div className="license-bar">
            <div className="progress-text">
                {actual} / {max}
            </div>
            <div className="license-progress" style={{ width: (actual / max) * 100 + '%' }} />
        </div>
    );
};
