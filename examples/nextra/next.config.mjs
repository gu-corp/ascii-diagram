import nextra from 'nextra';
import remarkAsciiDiagram from '@gu-corp/remark-ascii-diagram';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: {
    remarkPlugins: [
      // Use the remark plugin with default options
      remarkAsciiDiagram,
      // Or with custom options:
      // [remarkAsciiDiagram, { classPrefix: 'diagram', cellSize: 12 }],
    ],
  },
});

export default withNextra({
  // Your Next.js config
});
