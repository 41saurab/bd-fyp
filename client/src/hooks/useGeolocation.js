import { useState, useCallback } from "react";

export default function useGeolocation() {
	const [coords, setCoords] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const request = useCallback(() => {
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser.");
			return;
		}
		setLoading(true);
		setError(null);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
				setLoading(false);
			},
			(err) => {
				setError(err.message || "Location access denied.");
				setLoading(false);
			},
			{ timeout: 10000, maximumAge: 300000 },
		);
	}, []);

	return { coords, loading, error, request };
}
