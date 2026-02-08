import { EffectComposer, Bloom, N8AO, Vignette } from '@react-three/postprocessing';

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.3}
        intensity={0.4}
        mipmapBlur
      />
      <N8AO
        aoRadius={2}
        intensity={1.5}
        distanceFalloff={0.5}
        halfRes
      />
      <Vignette offset={0.3} darkness={0.4} />
    </EffectComposer>
  );
}
