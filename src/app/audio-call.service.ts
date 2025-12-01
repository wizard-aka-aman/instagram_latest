declare global {
  interface HTMLMediaElement {
    setSinkId?(deviceId: string): Promise<void>;
    sinkId?: string;
  }
}
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioCallService {
  private hubConnection!: signalR.HubConnection;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  private incomingCallSubject = new BehaviorSubject<any>(null);
  public incomingCall$ = this.incomingCallSubject.asObservable();

  private callStateSubject = new BehaviorSubject<string>('idle');
  public callState$ = this.callStateSubject.asObservable();

  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  public remoteStream$ = this.remoteStreamSubject.asObservable();

  private currentCallId: string | null = null;
  private currentUsername: string = '';
  private remoteUsername: string | null = null;
  
  // Store pending offer until user accepts
  private pendingOffer: any = null;
  private pendingIceCandidates: any[] = []; // ✅ Store ICE candidates received before answer
 // ✅ NEW: Speaker mode tracking
  private isSpeakerOnSubject = new BehaviorSubject<boolean>(false);
  public isSpeakerOn$ = this.isSpeakerOnSubject.asObservable();
  
  // ✅ NEW: Available audio output devices
  private availableAudioDevices: MediaDeviceInfo[] = [];

  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:relay1.expressturn.com:3480',
        username: 'efPU52K4SLOQ34W2QY',
        credential: '1TJPNFxHKXrZfelz'
      }
    ],
    iceCandidatePoolSize: 10
  };

  constructor() {}

  async startConnection(username: string, baseUrl: string): Promise<void> {
    this.currentUsername = (username || '').trim().toLowerCase();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/audioCallHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupSignalRListeners();

    this.hubConnection.onreconnected(() => {
      console.log('AudioCallHub reconnected');
      this.hubConnection.invoke('JoinCallRoom', this.currentUsername).catch(err => {
        console.error('Error rejoining call room:', err);
      });
    });

    try {
      await this.hubConnection.start();
      console.log('AudioCallHub connected successfully');
      await this.hubConnection.invoke('JoinCallRoom', this.currentUsername);
      console.log('Joined call room:', this.currentUsername);
    } catch (err) {
      console.error('Error connecting to AudioCallHub:', err);
      setTimeout(() => this.startConnection(this.currentUsername, baseUrl), 5000);
    }
  }

  private setupSignalRListeners(): void {
    // Incoming call notification
    this.hubConnection.on('IncomingCall', (callId: string, callerId: string, callerName: string, callerProfilePicture: string) => {
      console.log('📞 Incoming call from:', callerId);
      this.currentCallId = callId;
      this.remoteUsername = (callerId || '').trim().toLowerCase();
      this.callStateSubject.next('ringing');
      this.incomingCallSubject.next({
        callId,
        callerId: this.remoteUsername,
        callerName,
        callerProfilePicture
      });
    });

    // Caller receives CallAnswered
    this.hubConnection.on('CallAnswered', (callId: string, receiverId: string) => {
      console.log('✅ Call answered by:', receiverId);
      this.callStateSubject.next('active');
    });

    // Call rejected
    this.hubConnection.on('CallRejected', (callId: string) => {
      console.log('❌ Call rejected');
      this.callStateSubject.next('rejected');
      this.cleanup();
    });

    // Call ended
    this.hubConnection.on('CallEnded', (callId: string) => {
      console.log('📴 Call ended by remote');
      this.callStateSubject.next('ended');
      this.cleanup();
    });

    // Busy
    this.hubConnection.on('UserBusy', (callId: string) => {
      console.log('📵 User is busy');
      this.callStateSubject.next('busy');
      this.cleanup();
    });

    // ✅ FIX: Store offer but DON'T process until user accepts
    this.hubConnection.on('ReceiveOffer', async (callId: string, fromUser: string, offer: any) => {
      console.log('📥 Received offer from:', fromUser);
      this.currentCallId = callId;
      this.remoteUsername = (fromUser || '').trim().toLowerCase();
      
      // ✅ STORE the offer, don't process it yet
      this.pendingOffer = offer;
      console.log('💾 Offer stored, waiting for user to accept call');
    });

    this.hubConnection.on('ReceiveAnswer', async (callId: string, fromUser: string, answer: any) => {
      console.log('📥 Received answer from:', fromUser);
      try {
        await this.handleAnswer(answer);
      } catch (err) {
        console.error('❌ handleAnswer error:', err);
      }
    });

    this.hubConnection.on('ReceiveIceCandidate', async (callId: string, fromUser: string, candidate: any) => {
      try {
        await this.handleIceCandidate(candidate);
      } catch (err) {
        console.error('❌ handleIceCandidate error:', err);
      }
    });
  }

  async initiateCall(receiverId: string, callerName: string, callerProfilePicture: string): Promise<void> {
    if (!receiverId) throw new Error('Receiver not specified');

    try {
      const remote = receiverId.trim().toLowerCase();
      this.remoteUsername = remote;

      console.log('🎤 Getting microphone access for caller...');
      // ✅ Get microphone access FIRST
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('✅ Microphone access granted for caller');

      // Create call on server
      const callId: string | null = await this.hubConnection.invoke(
        'InitiateCall', 
        this.currentUsername, 
        remote, 
        callerName, 
        callerProfilePicture
      );
      
      if (!callId) {
        throw new Error('Failed to create call on server');
      }
      this.currentCallId = callId;
      console.log('📞 Call created with ID:', callId);

      // Create peer connection
      this.createPeerConnection();

      // ✅ Add local audio track
      this.localStream.getTracks().forEach(track => {
        console.log('➕ Adding local track:', track.kind);
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Create and send offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      console.log('📤 Sending offer to:', this.remoteUsername);

      await this.hubConnection.invoke('SendOffer', this.currentCallId, this.currentUsername, this.remoteUsername, offer);

      this.callStateSubject.next('calling');
    } catch (err) {
      console.error('❌ Error initiating call:', err);
      this.cleanup();
      throw err;
    }
  }

 async answerCall(callId: string): Promise<void> {
  try {
    this.currentCallId = callId;
    console.log('📞 Answering call:', callId);

    // ✅ STEP 1: Get microphone access
    console.log('🎤 Getting microphone access for receiver...');
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('✅ Microphone access granted for receiver');
    }

    // ✅ STEP 2: Validate pending offer
    if (!this.pendingOffer) {
      throw new Error('No pending offer to answer');
    }

    // ✅ STEP 3: Create peer connection
    this.createPeerConnection();

    // ✅ STEP 4: Set remote description FIRST (CRITICAL!)
    console.log('🔥 Setting remote description (offer)...');
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(this.pendingOffer));
    console.log('✅ Remote description (offer) set');

    // ✅ STEP 5: NOW add local tracks AFTER remote description
    this.localStream.getTracks().forEach(track => {
      console.log('➕ Adding receiver local track:', track.kind, 'enabled:', track.enabled);
      this.peerConnection?.addTrack(track, this.localStream!);
    });

    // ✅ STEP 6: Create answer
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    console.log('📤 Sending answer to:', this.remoteUsername);

    // ✅ STEP 7: Send answer back
    await this.hubConnection.invoke('SendAnswer', this.currentCallId, this.currentUsername, this.remoteUsername, answer);

    // ✅ STEP 8: Process pending ICE candidates
    console.log('🧊 Processing', this.pendingIceCandidates.length, 'pending ICE candidates');
    for (const candidate of this.pendingIceCandidates) {
      await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
    }
    this.pendingIceCandidates = [];

    // Clear pending offer
    this.pendingOffer = null;

    // Notify server
    await this.hubConnection.invoke('AnswerCall', this.currentCallId, this.currentUsername);
    console.log('✅ Call answered successfully');

    this.callStateSubject.next('active');
  } catch (err) {
    console.error('❌ Error answering call:', err);
    this.cleanup();
    throw err;
  }
}

  async rejectCall(callId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('RejectCall', callId, this.currentUsername);
      this.pendingOffer = null;
      this.pendingIceCandidates = [];
    } catch (err) {
      console.error('❌ Error rejecting call:', err);
    } finally {
      this.cleanup();
    }
  }

  async endCall(): Promise<void> {
    try {
      if (this.currentCallId) {
        await this.hubConnection.invoke('EndCall', this.currentCallId, this.currentUsername);
      }
    } catch (err) {
      console.error('❌ Error ending call:', err);
    } finally {
      this.cleanup();
    }
  }

  private createPeerConnection(): void {
    if (this.peerConnection) {
      console.log('⚠️ Peer connection already exists');
      return;
    }

    console.log('🔗 Creating peer connection...');
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // ✅ ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentCallId && this.remoteUsername) {
        console.log('🧊 Sending ICE candidate to:', this.remoteUsername);
        this.hubConnection.invoke('SendIceCandidate', this.currentCallId, this.currentUsername, this.remoteUsername, event.candidate)
          .catch(err => console.error('❌ SendIceCandidate error:', err));
      }
    };

    // ✅ Remote track - CRITICAL for receiving audio
    this.peerConnection.ontrack = (event) => {
      console.log('🎵 ✅ Received remote track! Kind:', event.track.kind, 'Enabled:', event.track.enabled);
      console.log('📻 Remote stream:', event.streams[0]);
      
      this.remoteStream = event.streams[0];
      this.remoteStreamSubject.next(this.remoteStream);
      
      // ✅ Log track info
      event.streams[0].getTracks().forEach(track => {
        console.log('🎵 Remote track details:', {
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        });
      });
    };

    // Connection state monitoring
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('🔗 Peer connection state:', state);
      
      if (state === 'connected') {
        console.log('✅ Peer connection established successfully!');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        console.log('❌ Peer connection', state);
        this.endCall().catch(err => console.error('endCall error:', err));
      }
    };

    // ✅ ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    console.log('✅ Peer connection created');
  }

  private async handleAnswer(answer: any): Promise<void> {
    try {
      if (!this.peerConnection) {
        console.warn('⚠️ Received answer but peerConnection missing');
        return;
      }
      
      // ✅ Check peer connection state before setting remote description
      console.log('📥 Current signaling state:', this.peerConnection.signalingState);
      
      if (this.peerConnection.signalingState !== 'have-local-offer') {
        console.warn('⚠️ Received answer but not in correct state:', this.peerConnection.signalingState);
        return;
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Remote answer set successfully');
      
      // ✅ Process any pending ICE candidates
      if (this.pendingIceCandidates.length > 0) {
        console.log('🧊 Processing', this.pendingIceCandidates.length, 'pending ICE candidates after answer');
        for (const candidate of this.pendingIceCandidates) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
        this.pendingIceCandidates = [];
      }
    } catch (err) {
      console.error('❌ handleAnswer error:', err);
    }
  }

  private async handleIceCandidate(candidate: any): Promise<void> {
    try {
      if (!candidate) return;
      
      if (this.peerConnection && this.peerConnection.remoteDescription) {
        console.log('🧊 Adding ICE candidate immediately');
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.log('🧊 Storing ICE candidate for later (no remote description yet)');
        this.pendingIceCandidates.push(candidate);
      }
    } catch (err) {
      console.error('❌ handleIceCandidate error:', err);
    }
  }

  private cleanup(): void {
    try {
      console.log('🧹 Cleaning up...');
      
      if (this.localStream) {
        this.localStream.getTracks().forEach(t => {
          t.stop();
          console.log('🛑 Stopped local track:', t.kind);
        });
        this.localStream = null;
      }

      if (this.peerConnection) {
        try { 
          this.peerConnection.close();
          console.log('🔒 Peer connection closed');
        } catch { }
        this.peerConnection = null;
      }

      this.currentCallId = null;
      this.remoteUsername = null;
      this.remoteStream = null;
      this.pendingOffer = null;
      this.pendingIceCandidates = [];
      this.remoteStreamSubject.next(null);
      this.incomingCallSubject.next(null);
       this.isSpeakerOnSubject.next(false);

      setTimeout(() => {
        this.callStateSubject.next('idle');
      }, 200);
      
      console.log('✅ Cleanup complete');
    } catch (err) {
      console.error('❌ cleanup error:', err);
    }
  }

  async stopConnection(): Promise<void> {
    try {
      if (this.hubConnection) {
        await this.hubConnection.invoke('LeaveCallRoom', this.currentUsername);
        await this.hubConnection.stop();
      }
    } catch (err) {
      console.error('❌ stopConnection error:', err);
    } finally {
      this.cleanup();
    }
  }

  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🔇 Mute toggled:', !audioTrack.enabled);
        return !audioTrack.enabled;
      }
    }
    return false;
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'disconnected';
  }
    async toggleSpeaker(audioElement: HTMLAudioElement): Promise<boolean> {
    try {
      const currentSpeakerState = this.isSpeakerOnSubject.value;
      const newSpeakerState = !currentSpeakerState;
      
      console.log('🔊 Toggling speaker:', currentSpeakerState ? 'OFF' : 'ON');
      
      // Check if browser supports setSinkId (not supported on iOS Safari)
      if (typeof audioElement.setSinkId === 'function') {
        await this.getAudioDevices();
        
        if (newSpeakerState) {
          // Switch to loudspeaker
          const speakerDevice = this.availableAudioDevices.find(
            device => device.kind === 'audiooutput' && 
            device.label.toLowerCase().includes('speaker')
          );
          
          if (speakerDevice) {
            await audioElement.setSinkId(speakerDevice.deviceId);
            console.log('✅ Switched to loudspeaker:', speakerDevice.label);
          } else {
            // Fallback: use default output
            await audioElement.setSinkId('');
          }
        } else {
          // Switch to earpiece/default
          const earpiece = this.availableAudioDevices.find(
            device => device.kind === 'audiooutput' && 
            (device.label.toLowerCase().includes('earpiece') || 
             device.label.toLowerCase().includes('receiver'))
          );
          
          if (earpiece) {
            await audioElement.setSinkId(earpiece.deviceId);
            console.log('✅ Switched to earpiece:', earpiece.label);
          } else {
            // Use default (usually earpiece on mobile)
            await audioElement.setSinkId('');
          }
        }
        
        // Increase volume when speaker is on
        audioElement.volume = newSpeakerState ? 1.0 : 0.8;
      } else {
        // For iOS Safari - use volume control as alternative
        console.log('⚠️ setSinkId not supported, using volume control');
        audioElement.volume = newSpeakerState ? 1.0 : 0.6;
      }
      
      this.isSpeakerOnSubject.next(newSpeakerState);
      return newSpeakerState;
      
    } catch (error) {
      console.error('❌ Error toggling speaker:', error);
      return this.isSpeakerOnSubject.value;
    }
  }

  // ✅ NEW: Get available audio devices
  private async getAudioDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableAudioDevices = devices.filter(
        device => device.kind === 'audiooutput'
      );
      
      console.log('🔊 Available audio devices:', this.availableAudioDevices.map(d => ({
        label: d.label,
        deviceId: d.deviceId
      })));
    } catch (error) {
      console.error('❌ Error getting audio devices:', error);
    }
  }

  // ✅ NEW: Set specific audio output device
  async setAudioOutputDevice(audioElement: HTMLAudioElement, deviceId: string): Promise<void> {
    try {
      if (typeof audioElement.setSinkId === 'function') {
        await audioElement.setSinkId(deviceId);
        console.log('✅ Audio output device changed to:', deviceId);
      } else {
        console.warn('⚠️ setSinkId not supported on this browser');
      }
    } catch (error) {
      console.error('❌ Error setting audio output device:', error);
    }
  }

  // ✅ NEW: Get list of available speakers
  async getAvailableSpeakers(): Promise<MediaDeviceInfo[]> {
    await this.getAudioDevices();
    return this.availableAudioDevices;
  }
}