import { defineConfig } from '@adonisjs/inertia';
const inertiaConfig = defineConfig({
    rootView: 'inertia_layout',
    sharedData: {},
    ssr: {
        enabled: true,
        entrypoint: 'inertia/app/ssr.tsx',
    },
});
export default inertiaConfig;
//# sourceMappingURL=inertia.js.map