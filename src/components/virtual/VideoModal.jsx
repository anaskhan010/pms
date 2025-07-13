import { useState, useRef, useEffect } from "react";

const VideoModal = ({ title, videoUrl, onClose, details }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Toggle video mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      const iframe = videoRef.current;
      const currentSrc = iframe.src;
      // Replace mute parameter in the URL
      const newSrc = isMuted
        ? currentSrc.replace("mute=1", "mute=0")
        : currentSrc.replace("mute=0", "mute=1");
      iframe.src = newSrc;
    }
  };

  // Reset iframe when modal opens
  useEffect(() => {
    if (videoRef.current) {
      const iframe = videoRef.current;
      const baseUrl = videoUrl.split("?")[0];
      const params = videoUrl.split("?")[1] || "";
      iframe.src = `${baseUrl}?${params}&rel=0&t=${new Date().getTime()}`;
    }
  }, [videoUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-200 focus:outline-none"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    clipRule="evenodd"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-1 bg-gray-100">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              ref={videoRef}
              src={videoUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="p-4 bg-white">
          <h4 className="font-semibold text-lg mb-2">Property Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {details.map((detail, index) => (
              <div key={index}>
                <p className="text-gray-600">{detail.label}</p>
                <p className="font-medium">{detail.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
