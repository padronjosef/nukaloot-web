import { AppShell } from "../components/header/organisms/AppShell";

const MainLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <AppShell>{children}</AppShell>;
};

export default MainLayout;
