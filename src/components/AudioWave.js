import React, { useEffect, useRef, useState } from 'react';
import { AudioVisualizer } from 'react-audio-visualize';
import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities';
import { API_URL, RECORDINGS_URL, RECORDINGS_URL_BACKUP } from '../config/globals';

const primary = getStyle('--secondary');

const AudioWave = ({ path }) => {
    const [blob, setBlob] = useState();
    const visualizerRef = useRef(null)

    useEffect(() => {
        const f = async () => {
            try {
                const res = await fetch(`${API_URL}${path}`);
                setBlob(res);
            } catch (err) {
                try {
                    const res = await fetch(`${API_URL}${path}`);
                    setBlob(res);
                } catch (error) {

                }
            }
        };
        f();
    }, [])

    return (
        <div>
            {blob && (
                <AudioVisualizer
                    ref={visualizerRef}
                    blob={blob}
                    width={300}
                    height={50}
                    barWidth={1}
                    gap={0}
                    barColor={primary}
                />
            )}
        </div>
    )
}

export default AudioWave;