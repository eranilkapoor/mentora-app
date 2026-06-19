import React, { useCallback, useEffect, useState } from 'react';
import {
  ImageBackground,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useMediaSettings } from '@/features/MediaSettings/useMediaSettings';

interface InlineVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | undefined;
  placeholderText: string;
  previewStyle: StyleProp<ViewStyle>;
  thumbnailStyle: StyleProp<ViewStyle>;
  thumbnailImageStyle: StyleProp<ImageStyle>;
  overlayStyle: StyleProp<ViewStyle>;
  placeholderStyle: StyleProp<ViewStyle>;
  playButtonStyle: StyleProp<ViewStyle>;
  placeholderTextStyle: StyleProp<TextStyle>;
}

export function InlineVideoPlayer({
  videoUrl,
  thumbnailUrl,
  placeholderText,
  previewStyle,
  thumbnailStyle,
  thumbnailImageStyle,
  overlayStyle,
  placeholderStyle,
  playButtonStyle,
  placeholderTextStyle,
}: InlineVideoPlayerProps): React.ReactElement {
  const { theme, reduceAnimations } = useTheme();
  const { shouldAutoplayVideo } = useMediaSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const player = useVideoPlayer(videoUrl, (instance) => {
    instance.loop = false;
  });

  const safePause = useCallback((): void => {
    try {
      player.pause();
    } catch {
      // Expo can throw if iOS releases/replaces the native player mid-transition.
    }
  }, [player]);

  const safePlay = useCallback((): void => {
    try {
      player.play();
    } catch {
      setIsPlaying(false);
    }
  }, [player]);

  useEffect(() => {
    const canAutoplay = shouldAutoplayVideo && !reduceAnimations;
    setIsPlaying(canAutoplay);
    setShouldPlay(canAutoplay);

    return () => {
      safePause();
    };
  }, [
    reduceAnimations,
    safePause,
    shouldAutoplayVideo,
    thumbnailUrl,
    videoUrl,
  ]);

  useEffect(() => {
    if (!shouldPlay || !isPlaying) return;
    safePlay();
  }, [isPlaying, safePlay, shouldPlay]);

  const togglePlayback = (): void => {
    if (isPlaying) {
      safePause();
      setIsPlaying(false);
      setShouldPlay(false);
      return;
    }

    setShouldPlay(true);
    setIsPlaying(true);
  };

  return (
    <TouchableOpacity
      style={previewStyle}
      onPress={togglePlayback}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause video intro' : 'Play video intro'}
    >
      {isPlaying ? (
        <VideoView
          player={player}
          style={previewStyle}
          nativeControls
          contentFit="cover"
          allowsFullscreen={false}
          playsInline
        />
      ) : thumbnailUrl ? (
        <ImageBackground
          source={{ uri: thumbnailUrl }}
          style={thumbnailStyle}
          imageStyle={thumbnailImageStyle}
        >
          <View style={overlayStyle}>
            <View style={playButtonStyle}>
              <Feather name="play" size={22} color={theme.colors.white} />
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={placeholderStyle}>
          <View style={playButtonStyle}>
            <Feather name="play" size={22} color={theme.colors.white} />
          </View>
          <Text style={placeholderTextStyle}>{placeholderText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
