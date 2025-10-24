"use client";
import { ShoppingCart, User, Menu, Search, ChevronDown, LogIn, Heart, UserPlus, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";


export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfilePicture, setUserProfilePicture] = useState("");
  const [userRole, setUserRole] = useState("");

  const cartTotalItems = useSelector((state: RootState) => state.cart.totalItems);
  const [displayCartCount, setDisplayCartCount] = useState(0);

  const [categories, setCategories] = useState<{ _id: string; name: string; image: string; slug: string; description?: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus();

    // Listen for user data updates from profile page
    const handleUserDataUpdate = () => {
      checkLoginStatus();
    };

    window.addEventListener('user-data-updated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate);
    };
  }, []);

  // Listen for cart updates from custom event
  useEffect(() => {
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { totalItems } = customEvent.detail;
      setDisplayCartCount(totalItems);
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    // Initialize with current cart count from Redux
    setDisplayCartCount(cartTotalItems);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [cartTotalItems]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          console.error("Failed to load categories:", data.error);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || "User");
        setUserProfilePicture(userData.profilePicture || "");
        setUserRole(userData.role || "");
      } catch (error) {
        setUserName("User");
        setUserProfilePicture("");
        setUserRole("");
      }
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserProfilePicture("");
      setUserRole("");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    checkLoginStatus(); // Refresh login status when opening menu
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMenuOpen(false);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowLogoutModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsUserMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Update state
      setIsLoggedIn(false);
      setUserName("");
      setUserProfilePicture("");
      setUserRole("");
      setShowLogoutModal(false);

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserName("");
      setUserProfilePicture("");
      setUserRole("");
      setShowLogoutModal(false);
      router.push('/');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="sticky top-0 left-0 w-full h-[84px] bg-white flex items-center justify-between px-6 md:px-20 shadow-md z-50">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex-shrink-0 cursor-pointer block">
            <svg width="116" height="30" viewBox="0 0 116 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.3865 0.000358484C17.2567 -0.0504446 16.8786 5.31532 16.8749 5.36651V8.63795L17.8491 6.79813H19.5926L20.6119 12.6369C20.2974 11.6769 8.89978 7.93308 7.07808 16.1496C5.23163 24.4797 12.4636 24.4805 12.4636 24.4805C10.8283 27.4164 5.84711 30 5.84711 30C5.84711 30 9.07818 24.4808 8.30905 24.4805H0L3.07743 6.79813H5.7442C5.7442 6.79813 5.48809 0.0514483 11.3865 0.000358484ZM11.2757 1.3939C9.602 1.45154 8.62769 2.27143 8.09049 3.08919C7.82764 3.48943 7.67193 3.88345 7.58184 4.17609C7.53666 4.32288 7.50713 4.44644 7.48873 4.53546C7.47953 4.57999 7.47349 4.61661 7.46913 4.64288C7.46695 4.656 7.46542 4.66703 7.46423 4.67511C7.46365 4.67898 7.46263 4.68223 7.46227 4.68487V4.68878L7.46129 4.68976L7.45737 4.72296V8.69068L8.40804 8.91431L9.295 7.14676H15.1803V4.721L15.1754 4.68683L15.1745 4.68487V4.68097C15.1741 4.67835 15.1731 4.67509 15.1725 4.6712C15.1712 4.66298 15.1699 4.6515 15.1676 4.638C15.1629 4.61065 15.1559 4.57243 15.146 4.52569C15.1263 4.43219 15.0945 4.30205 15.047 4.14777C14.9526 3.84077 14.7911 3.4275 14.5217 3.01399C13.9707 2.16838 12.9718 1.33563 11.2757 1.3939Z" fill="#F81515" />
              <path fillRule="evenodd" clipRule="evenodd" d="M7.92002 17.3012C8.44922 13.7658 11.6659 11.4143 15.2426 11.9458C19.1452 12.5258 21.3762 15.4285 20.4498 20.3421C19.842 23.5656 17.9613 25.7572 17.9613 25.7572C14.4784 29.0879 8.70585 29.9945 8.67775 29.9989C8.67775 29.9989 8.68278 29.9961 8.69129 29.9915C8.92916 29.862 12.1683 28.099 13.8992 26.0646C14.8117 25.0526 15.4271 23.8276 15.7226 23.2217C15.5825 23.4721 15.826 23.0096 15.7226 23.2217C14.8746 23.8295 13.7217 23.7947 12.5213 23.6164C9.37756 23.1492 7.44219 20.4934 7.92002 17.3012ZM14.2171 14.2585C12.2342 14.2585 10.6268 15.8602 10.6268 17.8359C10.6268 19.8116 12.2342 21.4133 14.2171 21.4133C16.2 21.4133 17.8074 19.8116 17.8074 17.8359C17.8074 15.8602 16.2 14.2585 14.2171 14.2585Z" fill="#030104" />
              <path d="M27.6838 23.9648V4.00031H31.7188V12.6759H31.8006L38.4802 4.00031H42.9242L36.7626 11.8676L44.0147 23.9648H39.598L34.3634 14.9929L31.7188 18.3608V23.9648H27.6838Z" fill="#F81515" />
              <path d="M50.5184 24.342C49.2824 24.342 48.21 24.1175 47.3013 23.6685C46.3925 23.2194 45.6382 22.6895 45.0384 22.0788L47.1649 19.681C47.5103 20.0941 47.9647 20.4353 48.5281 20.7048C49.1098 20.9742 49.6914 21.1089 50.273 21.1089C51.0909 21.1089 51.827 20.8844 52.4814 20.4353C53.1539 19.9683 53.681 19.196 54.0627 18.1183C54.4625 17.0406 54.6625 15.5767 54.6625 13.7266C54.6625 12.1101 54.4989 10.8258 54.1717 9.87382C53.8627 8.90388 53.4447 8.21235 52.9176 7.79923C52.3905 7.36815 51.7907 7.15261 51.1182 7.15261C50.6274 7.15261 50.173 7.27834 49.755 7.5298C49.3369 7.78127 49.0007 8.16745 48.7462 8.68834C48.5099 9.19127 48.3918 9.82891 48.3918 10.6013C48.3918 11.3197 48.5099 11.9215 48.7462 12.4064C48.9825 12.8734 49.3188 13.2237 49.755 13.4572C50.1912 13.6727 50.7001 13.7805 51.2818 13.7805C51.827 13.7805 52.3996 13.6099 52.9994 13.2686C53.5992 12.9273 54.1444 12.3436 54.6352 11.5173L54.826 14.1846C54.4807 14.6876 54.0536 15.1187 53.5446 15.4779C53.0357 15.8371 52.5177 16.1155 51.9906 16.3131C51.4817 16.5107 50.9909 16.6095 50.5184 16.6095C49.3915 16.6095 48.3918 16.3939 47.5194 15.9629C46.6469 15.5138 45.9562 14.8492 45.4473 13.9691C44.9566 13.089 44.7112 11.9664 44.7112 10.6013C44.7112 9.27209 45.002 8.13152 45.5836 7.17955C46.1653 6.20961 46.9377 5.4642 47.9011 4.94331C48.8644 4.42241 49.9186 4.16197 51.0636 4.16197C52.027 4.16197 52.9358 4.35057 53.79 4.72776C54.6625 5.10496 55.4349 5.67974 56.1074 6.4521C56.7981 7.22445 57.3343 8.21235 57.716 9.41579C58.1159 10.6192 58.3158 12.0562 58.3158 13.7266C58.3158 15.5767 58.1068 17.1753 57.6887 18.5224C57.2707 19.8516 56.6891 20.9473 55.9438 21.8094C55.1986 22.6716 54.3535 23.3092 53.4083 23.7224C52.4814 24.1355 51.518 24.342 50.5184 24.342Z" fill="#F81515" />
              <path d="M67.8146 23.9648V4.00031H74.4942C75.8756 4.00031 77.1115 4.15299 78.2021 4.45834C79.3108 4.76369 80.1833 5.2756 80.8194 5.99407C81.4737 6.71254 81.8009 7.69146 81.8009 8.93082C81.8009 9.54152 81.6827 10.1432 81.4465 10.736C81.2284 11.3108 80.9194 11.8227 80.5195 12.2717C80.1196 12.7208 79.6289 13.0531 79.0473 13.2686V13.3764C80.1378 13.6278 81.0375 14.1487 81.7464 14.939C82.4552 15.7114 82.8097 16.7622 82.8097 18.0913C82.8097 19.4205 82.4643 20.5252 81.7736 21.4053C81.1011 22.2675 80.1742 22.9141 78.9927 23.3452C77.8295 23.7583 76.5027 23.9648 75.0122 23.9648H67.8146ZM71.8496 12.137H74.2216C75.4939 12.137 76.4209 11.9035 77.0025 11.4365C77.5841 10.9515 77.8749 10.3139 77.8749 9.52356C77.8749 8.64343 77.575 8.01477 76.9752 7.63757C76.3754 7.26038 75.4666 7.07178 74.2489 7.07178H71.8496V12.137ZM71.8496 20.8934H74.6578C76.0392 20.8934 77.0843 20.6509 77.7931 20.1659C78.5202 19.663 78.8837 18.8906 78.8837 17.8489C78.8837 16.8789 78.5202 16.1784 77.7931 15.7473C77.0843 15.2983 76.0392 15.0738 74.6578 15.0738H71.8496V20.8934Z" fill="#F81515" />
              <path d="M90.3253 24.342C88.6713 24.342 87.4717 23.8122 86.7265 22.7524C85.9813 21.6747 85.6087 20.1839 85.6087 18.2799V8.87694H89.5891V17.795C89.5891 18.9625 89.7618 19.7797 90.1072 20.2467C90.4525 20.7138 91.0069 20.9473 91.7702 20.9473C92.3882 20.9473 92.9244 20.8036 93.3788 20.5162C93.8514 20.2108 94.3421 19.7259 94.851 19.0613V8.87694H98.8588V23.9648H95.5872L95.2873 21.7825H95.1782C94.5239 22.5548 93.815 23.1745 93.0516 23.6415C92.2883 24.1085 91.3795 24.342 90.3253 24.342Z" fill="#F81515" />
              <path d="M104.195 30C103.74 30 103.35 29.9731 103.022 29.9192C102.695 29.8653 102.386 29.7934 102.096 29.7036L102.832 26.686C102.977 26.722 103.141 26.7579 103.322 26.7938C103.522 26.8477 103.713 26.8746 103.895 26.8746C104.676 26.8746 105.294 26.6591 105.749 26.228C106.203 25.7969 106.54 25.2491 106.758 24.5845L107.03 23.6685L101.087 8.87694H105.122L107.548 15.882C107.785 16.5646 108.003 17.2651 108.203 17.9836C108.403 18.702 108.612 19.4205 108.83 20.139H108.966C109.13 19.4205 109.302 18.711 109.484 18.0105C109.684 17.292 109.875 16.5825 110.057 15.882L112.156 8.87694H116L110.575 24.4229C110.138 25.6083 109.638 26.6142 109.075 27.4404C108.512 28.2846 107.839 28.9223 107.058 29.3534C106.294 29.7845 105.34 30 104.195 30Z" fill="#F81515" />
            </svg>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-[620px]">
          <div className="flex w-full h-9 bg-gray-100 rounded-l">
            <div className="flex items-center gap-4 px-8 cursor-pointer">
              <span className="text-[10px] font-normal whitespace-nowrap cursor-pointer">ALL CATEGORIES</span>
              <ChevronDown className="w-4 h-4 text-[#9299A5] cursor-pointer" />
            </div>
            <div className="w-px h-6 bg-black my-auto" />
            <input
              type="text"
              placeholder="I'M SEARCHING FOR"
              className="flex-1 bg-transparent px-6 text-[10px] text-[#9299A5] outline-none"
            />
          </div>
          <button className="h-9 w-[120px] bg-[#FF4D6D] rounded-r flex items-center justify-center cursor-pointer">
            <Search className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3 md:gap-6 lg:gap-12">
          {/* user profile button */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center cursor-pointer relative overflow-hidden"
            >
              {isLoggedIn && userProfilePicture ? (
                <img
                  src={userProfilePicture}
                  alt={userName}
                  className="w-full h-full object-cover border-2 border-[#FF4D6D]/20 bg-gradient-to-br from-[#FF4D6D] to-indigo-300 overflow-hidden shadow-lg "
                />
              ) : isLoggedIn && !userProfilePicture ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF4D6D] to-[#FE925A] text-white font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-6 h-6" />
              )}
            </button>

            {/* Admin Badge */}
            {isLoggedIn && userRole === 'admin' && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <button onClick={() => router.push("/cart")} className="relative w-9 h-9 rounded bg-gray-100 flex items-center justify-center cursor-pointer">
            <ShoppingCart className="w-6 h-6" />
            {/* User Cart Items Count badge */}
            {displayCartCount > 0 && (
              <div className="absolute top-[2px] right-[2px] w-4 h-4 bg-[#FF4D6D] rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-roboto"> {displayCartCount > 99 ? '99+' : displayCartCount}</span>
              </div>
            )}
          </button>
          <button
            onClick={toggleMenu}
            className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isMenuOpen || isUserMenuOpen || showLogoutModal
          ? "opacity-50 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={closeAll}
      />

      {/* Side Menu - Compact */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed lg:top-[74px] right-6 border-t border-gray-200 md:right-20 w-[260px] lg:w-[240px] bg-white shadow-xl rounded-lg z-50 transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        {/* Search Area - Mobile/Tablet Only */}
        <div className="lg:hidden px-4 pt-4 pb-3 border-b border-brand-pink">
          <div className="relative">
            <input
              type="text"
              placeholder="I'm searching for..."
              className="w-full h-10 pl-4 pr-10 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[#FF4D6D] transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF4D6D] rounded-md flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
          {categories.map((category, index) => (
            <Link
              key={category._id || index}
              href={`/shop`}
              onClick={toggleMenu}
              className="flex items-center gap-3 px-5 py-3 hover:bg-brand-pink/15 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-8 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 group-hover:text-[#FF4D6D] transition-colors">
                {category.name}
              </span>
            </Link>
          ))}


        </div>
      </div>

      {/* User Popup Menu */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed right-[120px] md:right-[200px] lg:right-[240px] top-[74px] border-t border-gray-200 w-[180px] bg-white shadow-lg rounded-lg z-50 transform transition-all duration-300 ease-in-out ${isUserMenuOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >
        <ul className="py-3">
          {isLoggedIn ? (
            <>
              {/* Logged In Menu */}
              <Link href="/profile" onClick={closeAll}>
                <li className="group flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors">
                  <User className="w-5 h-5 text-black group-hover:text-brand-pink transition-colors group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm text-gray-800 font-medium group-hover:text-brand-pink transition-colors duration-200">
                    Profile
                  </span>
                </li>
              </Link>

              <li className="group flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors">
                <Heart className="w-5 h-5 text-black group-hover:text-brand-pink transition-colors group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm text-gray-800 font-medium group-hover:text-brand-pink transition-colors duration-200">
                  Wishlist
                </span>
              </li>

              <li
                onClick={handleLogoutClick}
                className="group flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-5 h-5 text-black group-hover:text-brand-pink transition-colors group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm text-gray-800 font-medium group-hover:text-brand-pink transition-colors duration-200">
                  Logout
                </span>
              </li>
            </>
          ) : (
            <>
              {/* Not Logged In Menu */}
              <Link href="/login" onClick={closeAll}>
                <li className="group flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors">
                  <LogIn className="w-5 h-5 text-black group-hover:text-brand-pink transition-colors group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm text-gray-800 font-medium group-hover:text-brand-pink transition-colors duration-200">
                    Login
                  </span>
                </li>
              </Link>

              <Link href="/register" onClick={closeAll}>
                <li className="group flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors">
                  <UserPlus className="w-5 h-5 text-black group-hover:text-brand-pink transition-colors group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm text-black font-medium group-hover:text-brand-pink transition-colors duration-200">
                    Register
                  </span>
                </li>
              </Link>

              <li className="group flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors">
                <Heart className="w-5 h-5 text-black group-hover:text-brand-pink transition-colors group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm text-gray-800 font-medium group-hover:text-brand-pink transition-colors duration-200">
                  Wishlist
                </span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-[#FF4D6D] to-indigo-400 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-[#FF4D6D]" />
              </div>
              <div>
                <p className="text-gray-800 font-medium mb-1">
                  Are you sure you want to logout?
                </p>
                <p className="text-sm text-gray-600">
                  You will need to login again to access your account.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF4D6D] to-indigo-400 hover:shadow-lg text-white font-medium rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}