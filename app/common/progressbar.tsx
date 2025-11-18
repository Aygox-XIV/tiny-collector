import type { ChangeEvent } from 'react';

export interface ProgressBarProps {
    readonly max: number;
    readonly actual?: number;
    readonly autoMax?: boolean;
    readonly onClick?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ max, actual, autoMax, onClick }) => {
    const displayedActual = (autoMax ? max : actual) || 0;
    return (
        <div className="license-bar" onClick={onClick}>
            <div className="progress-text">
                {displayedActual} / {max}
            </div>
            <div className="license-progress" style={{ width: (displayedActual / max) * 100 + '%' }} />
        </div>
    );
};

export interface EditingProgressBarProps {
    readonly max: number;
    readonly actual?: number;
    readonly autoMax?: boolean;
    readonly edit: (newValue: number) => void;
}

export const EditingProgressBar: React.FC<EditingProgressBarProps> = ({ max, actual, autoMax, edit }) => {
    if (autoMax) {
        return ProgressBar({ max, actual, autoMax });
    }
    const displayedActual = actual || 0;
    const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
        edit(parseInt(event.target.value));
    };

    return (
        <div className="license-bar">
            <div className="progress-text">
                <input
                    type="number"
                    min={0}
                    max={max}
                    value={displayedActual}
                    onChange={updateValue}
                    className="progress-input"
                />{' '}
                / {max}
            </div>
            <div className="license-progress" style={{ width: (displayedActual / max) * 100 + '%' }} />
        </div>
    );
};
