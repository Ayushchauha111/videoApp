// Initialize variables
var localStream, remoteStream, localVideo, remoteVideo, startButton, hangupButton;
var localPeerConnection, remotePeerConnection;
var servers = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};

// Get HTML elements
localVideo = document.getElementById("localVideo");
remoteVideo = document.getElementById("remoteVideo");
startButton = document.getElementById("startButton");
hangupButton = document.getElementById("hangupButton");

// Add event listeners
startButton.addEventListener("click", startCall);
hangupButton.addEventListener("click", endCall);

// Function to start the call
function startCall() {
  // Get local video stream
  navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then(function(stream) {
      localStream = stream;
      localVideo.srcObject = localStream;
    })
    .catch(function(error) {
      console.log("Error getting local stream: " + error);
    });

  // Create local peer connection
  localPeerConnection = new RTCPeerConnection(servers);
  localPeerConnection.addStream(localStream);

  // Create remote peer connection
  remotePeerConnection = new RTCPeerConnection(servers);
  remotePeerConnection.onaddstream = function(event) {
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
  };

  // Start offer
  localPeerConnection.createOffer()
    .then(function(offer) {
      return localPeerConnection.setLocalDescription(offer);
    })
    .then(function() {
      return remotePeerConnection.setRemoteDescription(localPeerConnection.localDescription);
    })
    .then(function() {
      return remotePeerConnection.createAnswer();
    })
    .then(function(answer) {
      return remotePeerConnection.setLocalDescription(answer);
    })
    .then(function() {
      return localPeerConnection.setRemoteDescription(remotePeerConnection.localDescription);
    })
    .catch(function(error) {
      console.log("Error creating offer: " + error);
    });
}

// Function to end the call
function endCall() {
  localPeerConnection.close();
  remotePeerConnection.close();
  localStream.getTracks().forEach(function(track) {
    track.stop();
  });
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
}
