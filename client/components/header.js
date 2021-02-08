import Link from 'next/link';

const Header = ({ currentUser }) => {
  const headerLinks =
    // array
    [
      !currentUser && { label: "Sign Up", componentPath: "/auth/signup" },
      !currentUser && { label: "Sign In", componentPath: "/auth/signin" },
      currentUser && { label: "New Ticket", componentPath: "/tickets/new_ticket" },
      currentUser && { label: "My Orders", componentPath: "/orders" },
      currentUser && { label: "Sign Out", componentPath: "/auth/signout" },
    ]
      .filter((linkConfig) => linkConfig) // filter 只留下值為 true 的 item
      .map(
        (
          // 從 map loop 每一次讀取出來的物件裡面解構出對應的物件屬性，作為傳入 function 的變數
          { label, componentPath }
        ) => {
          return (
            <li key={componentPath} className="nav-item">
              <Link href={componentPath}>
                <a className="nav-link">{label}</a>
              </Link>
            </li>
          );
        }
      );

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTix</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{headerLinks}</ul>
      </div>
    </nav>
  );
};

export default Header;
