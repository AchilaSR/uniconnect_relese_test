import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../../config/globals';
import AudioWave from '../../../../components/AudioWave';

function AudioPlayer({ rurl, enableDownload }) {
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState(null);
    const [isValidUrl, setIsValidUrl] = useState(false);

    useEffect(() => {
        const url = `${API_URL}${rurl}`;

        // Perform a HEAD request to check if the file exists
        fetch(url, { method: 'GET' })
            .then(response => {
                if (response.ok) {
                    setIsValidUrl(true);

                    const audio = document.createElement('audio');
                    audio.src = url;

                    const canPlay = audio.canPlayType('audio/wav') !== '';
                    setIsSupported(canPlay);

                    audio.onerror = () => setError(audio.error || new Error('Audio playback error. Please try another browser or download the file.'));
                } else {
                    setError(new Error('The audio file could not be found.'));
                }
            })
            .catch(() => {
                setError(new Error('Network error. Please check your internet connection.'));
            });
    }, [rurl]);

    const getErrorMessage = (error) => {
        if (error.message) {
            return error.message;
        }
        switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
                return 'The audio playback was aborted. Please try again.';
            case error.MEDIA_ERR_NETWORK:
                return 'Network error. The audio could not be loaded.';
            case error.MEDIA_ERR_DECODE:
                return 'The recording file is corrupted or not supported by your browser.';
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                return 'The recording file is compressed and not supported by your browser.';
            default:
                return 'An unknown error occurred. Please try again later.';
        }
    };

    if (error) {
        return (
            <div className='bg-white p-3 mb-1 rounded text-center'>
                {getErrorMessage(error)} <br />
                {enableDownload && isValidUrl && (
                    <div className='mt-3'>
                        <a className='btn btn-outline-primary' href={`${API_URL}${rurl}`} download>
                            Click here to download the file
                        </a>
                    </div>
                )}
            </div>
        );
    }

    if (!isValidUrl) {
        return (
            <div className='bg-white p-3 mb-1 rounded text-center'>
                Checking file existence...
            </div>
        );
    }

    return (
        <div>
            {isSupported ? (
                <div className='bg-white p-3 mb-1 rounded text-center'>
                    <AudioWave path={rurl} />
                    <audio
                        onContextMenu={(e) => { if (!enableDownload) { e.preventDefault(); } }}
                        controlsList={enableDownload ? "" : "nodownload"}
                        style={{ verticalAlign: "middle" }}
                        controls
                    >
                        <source src={`${API_URL}${rurl}`} type="audio/wav" />
                    </audio>
                </div>
            ) : (
                <div className='bg-white p-3 mb-1 rounded text-center'>
                    {getErrorMessage(new Error('Audio format not supported.'))}
                    {enableDownload && isValidUrl && (
                        <div className='mt-3'>
                            <a className='btn btn-outline-primary' href={`${API_URL}${rurl}`} download>
                                Click here to download the file
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AudioPlayer;
