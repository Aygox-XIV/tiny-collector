import type { ChangeEvent } from 'react';

export interface ProgressBarProps {
    readonly max: number;
    readonly actual: number;
    readonly onClick?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ max, actual, onClick }) => {
    return (
        <div className="license-bar" onClick={onClick}>
            <div className="progress-text">
                {actual} / {max}
            </div>
            <div className="license-progress" style={{ width: (actual / max) * 100 + '%' }} />
        </div>
    );
};

export interface EditingProgressBarProps {
    readonly max: number;
    readonly actual: number;
    readonly edit: (newValue: number) => void;
}

export const EditingProgressBar: React.FC<EditingProgressBarProps> = ({ max, actual, edit }) => {
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
                    value={actual}
                    onChange={updateValue}
                    className="progress-input"
                />{' '}
                / {max}
            </div>
            <div className="license-progress" style={{ width: (actual / max) * 100 + '%' }} />
        </div>
    );
};
