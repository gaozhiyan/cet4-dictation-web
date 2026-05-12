export function generateStaticParams() {
  return [
    { id: '202406set1' },
    { id: '202406set2' },
    { id: '202506set2' },
    { id: '202512set1' }
  ]
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
