import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import CSVUploader from '../src/Users/Import';

export default function HomePage() {
  return (
    <>
      <Welcome />
      <ColorSchemeToggle />
      <CSVUploader />
    </>
  );
}
