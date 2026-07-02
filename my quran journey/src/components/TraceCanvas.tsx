import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/theme/theme';

interface Point {
  x: number;
  y: number;
}

interface TraceCanvasProps {
  guideLetter: string;
  prompt: string;
  onTraceComplete: () => void;
}

export const TraceCanvas = ({ guideLetter, prompt, onTraceComplete }: TraceCanvasProps) => {
  const [points, setPoints] = useState<Point[]>([]);
  const didComplete = useRef(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
          setPoints((current) => [...current, point]);
          if (!didComplete.current) {
            didComplete.current = true;
            onTraceComplete();
          }
        },
        onPanResponderMove: (event) => {
          const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
          setPoints((current) => {
            const next = [...current, point];
            return next;
          });
        },
      }),
    [onTraceComplete],
  );

  return (
    <View>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.canvas} {...responder.panHandlers}>
        <View style={styles.paperLine} />
        <View style={[styles.paperLine, styles.paperLineLower]} />
        <Text style={styles.guide}>{guideLetter}</Text>
        {points.map((point, index) => (
          <View
            key={`${point.x}-${point.y}-${index}`}
            style={[styles.dot, { left: point.x - 5, top: point.y - 5 }]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  prompt: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  canvas: {
    minHeight: 178,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 66,
    borderTopWidth: 1,
    borderTopColor: '#E6D7B8',
  },
  paperLineLower: {
    top: 118,
  },
  guide: {
    position: 'absolute',
    color: '#D4C59F',
    fontSize: 128,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  dot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
