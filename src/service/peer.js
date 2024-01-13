class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
              "stun:stun.ekiga.net",
              "stun:stun.ideasip.com",
              "stun:stun.rixtelecom.se",
              "stun:stun.schlund.de",
              "stun:stun.stunprotocol.org:3478",
              "stun:stun.voiparound.com",
              "stun:stun.voipbuster.com",
              "stun:stun.voipstunt.com",
              "stun:stun.voxgratia.org",
            ],
          },
        ],
      });
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }
}

export default new PeerService();
