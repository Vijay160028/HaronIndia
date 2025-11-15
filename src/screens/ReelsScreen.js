import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// YouTube Playlist Configuration
// Demo playlist: https://www.youtube.com/watch?v=aNyMzA49jFc&list=PL9lW8yNZ_O-zVlXH8-ABlzvPQDnTE7MLb
const YOUTUBE_PLAYLIST_ID = 'PL9lW8yNZ_O-zVlXH8-ABlzvPQDnTE7MLb';
// You'll need a YouTube Data API v3 key - get it from https://console.cloud.google.com/
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE';

const ReelsScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (YOUTUBE_PLAYLIST_ID && YOUTUBE_PLAYLIST_ID !== 'YOUR_PLAYLIST_ID_HERE') {
      fetchPlaylistVideos();
    } else {
      setLoading(false);
      setError('Please configure YouTube Playlist ID');
    }
  }, []);

  const fetchPlaylistVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API key is configured
      if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        throw new Error('YouTube API key not configured. Please add your API key in ReelsScreen.js');
      }

      // Fetch playlist items
      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YOUTUBE_PLAYLIST_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
      );

      if (!playlistResponse.ok) {
        const errorData = await playlistResponse.json().catch(() => ({}));
        if (playlistResponse.status === 403 || playlistResponse.status === 401) {
          throw new Error('Invalid API key or API not enabled. Please check your YouTube API key.');
        }
        throw new Error(errorData.error?.message || 'Failed to fetch playlist');
      }

      const playlistData = await playlistResponse.json();
      const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId).join(',');

      if (!videoIds) {
        throw new Error('No videos found in playlist');
      }

      // Fetch video details to get duration
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );

      if (!videosResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

      const videosData = await videosResponse.json();

      // Filter for Shorts (videos under 60 seconds)
      const shorts = videosData.items
        .filter(video => {
          const duration = video.contentDetails.duration;
          // Parse ISO 8601 duration (e.g., PT1M30S = 90 seconds)
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (!match) return false;
          const hours = parseInt(match[1] || 0);
          const minutes = parseInt(match[2] || 0);
          const seconds = parseInt(match[3] || 0);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          return totalSeconds <= 60; // Filter for videos 60 seconds or less
        })
        .map(video => ({
          id: video.id,
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
        }));

      setVideos(shorts);
    } catch (err) {
      console.error('Error fetching playlist videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaylistVideos();
  };

  const getYouTubeEmbedHTML = (videoId) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              overflow: hidden;
            }
            .video-container {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              background-color: #000;
            }
          </style>
        </head>
        <body>
          <div class="video-container">
            <iframe
              src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=https://www.youtube.com"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
          <script>
            window.addEventListener('load', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('loaded');
              }
            });
          </script>
        </body>
      </html>
    `;
  };

  const openInYouTube = (videoId) => {
    const url = `https://www.youtube.com/shorts/${videoId}`;
    Linking.openURL(url).catch(err => console.error('Error opening YouTube:', err));
  };

  const handleLoadStart = (videoId) => {
    setLoadingVideos(prev => ({ ...prev, [videoId]: true }));
  };

  const handleLoadEnd = (videoId) => {
    setLoadingVideos(prev => ({ ...prev, [videoId]: false }));
  };

  const renderReel = ({ item: video, index }) => {
    const isLoading = loadingVideos[video.id] !== false;

    return (
      <View style={styles.reelContainer}>
        <View style={styles.videoWrapper}>
          <WebView
            source={{ html: getYouTubeEmbedHTML(video.id) }}
            style={styles.video}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            onLoadStart={() => handleLoadStart(video.id)}
            onLoadEnd={() => handleLoadEnd(video.id)}
            onMessage={(event) => {
              if (event.nativeEvent.data === 'loaded') {
                handleLoadEnd(video.id);
              }
            }}
            onError={() => handleLoadEnd(video.id)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </View>

        <View style={styles.reelInfo}>
          <View style={styles.reelHeader}>
            <View style={styles.reelDetails}>
              <Text style={styles.reelTitle} numberOfLines={2}>{video.title}</Text>
              <Text style={styles.reelChannel}>{video.channel}</Text>
            </View>
            <TouchableOpacity
              style={styles.youtubeButton}
              onPress={() => openInYouTube(video.id)}
            >
              <Icon name="play-circle-filled" size={32} color="#FF0000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    const isConfigError = error.includes('configure') || error.includes('API key not configured');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#FF5722" />
          <Text style={styles.errorText}>{error}</Text>
          {isConfigError ? (
            <View style={styles.configInstructions}>
              <Text style={styles.errorSubtext}>
                To use YouTube Reels, you need to:
              </Text>
              <Text style={styles.instructionStep}>
                1. Get a YouTube Data API v3 key from{'\n'}
                {'   '}https://console.cloud.google.com/
              </Text>
              <Text style={styles.instructionStep}>
                2. Enable YouTube Data API v3 in your project
              </Text>
              <Text style={styles.instructionStep}>
                3. Replace YOUTUBE_API_KEY in ReelsScreen.js{'\n'}
                {'   '}(line 14) with your API key
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.retryButton} onPress={fetchPlaylistVideos}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (videos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyTitle}>No Reels Available</Text>
          <Text style={styles.emptySubtitle}>
            No Shorts found in this playlist. Make sure the playlist contains videos under 60 seconds.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reelContainer: {
    width: width,
    height: height,
    backgroundColor: '#000000',
  },
  videoWrapper: {
    width: width,
    height: height - 100, // Leave space for video info
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#000000',
  },
  errorText: {
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  configInstructions: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  instructionStep: {
    fontSize: 13,
    color: '#CCCCCC',
    textAlign: 'left',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reelInfo: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1A1A1A',
    height: 100,
    justifyContent: 'center',
  },
  reelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelDetails: {
    flex: 1,
    marginRight: 10,
  },
  reelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reelChannel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  youtubeButton: {
    padding: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#000000',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ReelsScreen;
