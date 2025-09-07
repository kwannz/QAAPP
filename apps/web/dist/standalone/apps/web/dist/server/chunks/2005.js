exports.id=2005,exports.ids=[2005],exports.modules={9424:(a,b,c)=>{"use strict";c.d(b,{n:()=>d});var d=`{
  "connect_wallet": {
    "label": "Connect Wallet",
    "wrong_network": {
      "label": "Wrong network"
    }
  },

  "intro": {
    "title": "What is a Wallet?",
    "description": "A wallet is used to send, receive, store, and display digital assets. It's also a new way to log in, without needing to create new accounts and passwords on every website.",
    "digital_asset": {
      "title": "A Home for your Digital Assets",
      "description": "Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs."
    },
    "login": {
      "title": "A New Way to Log In",
      "description": "Instead of creating new accounts and passwords on every website, just connect your wallet."
    },
    "get": {
      "label": "Get a Wallet"
    },
    "learn_more": {
      "label": "Learn More"
    }
  },

  "sign_in": {
    "label": "Verify your account",
    "description": "To finish connecting, you must sign a message in your wallet to verify that you are the owner of this account.",
    "message": {
      "send": "Sign message",
      "preparing": "Preparing message...",
      "cancel": "Cancel",
      "preparing_error": "Error preparing message, please retry!"
    },
    "signature": {
      "waiting": "Waiting for signature...",
      "verifying": "Verifying signature...",
      "signing_error": "Error signing message, please retry!",
      "verifying_error": "Error verifying signature, please retry!",
      "oops_error": "Oops, something went wrong!"
    }
  },

  "connect": {
    "label": "Connect",
    "title": "Connect a Wallet",
    "new_to_ethereum": {
      "description": "New to Ethereum wallets?",
      "learn_more": {
        "label": "Learn More"
      }
    },
    "learn_more": {
      "label": "Learn more"
    },
    "recent": "Recent",
    "status": {
      "opening": "Opening %{wallet}...",
      "connecting": "Connecting",
      "connect_mobile": "Continue in %{wallet}",
      "not_installed": "%{wallet} is not installed",
      "not_available": "%{wallet} is not available",
      "confirm": "Confirm connection in the extension",
      "confirm_mobile": "Accept connection request in the wallet"
    },
    "secondary_action": {
      "get": {
        "description": "Don't have %{wallet}?",
        "label": "GET"
      },
      "install": {
        "label": "INSTALL"
      },
      "retry": {
        "label": "RETRY"
      }
    },
    "walletconnect": {
      "description": {
        "full": "Need the official WalletConnect modal?",
        "compact": "Need the WalletConnect modal?"
      },
      "open": {
        "label": "OPEN"
      }
    }
  },

  "connect_scan": {
    "title": "Scan with %{wallet}",
    "fallback_title": "Scan with your phone"
  },

  "connector_group": {
    "installed": "Installed",
    "recommended": "Recommended",
    "other": "Other",
    "popular": "Popular",
    "more": "More",
    "others": "Others"
  },

  "get": {
    "title": "Get a Wallet",
    "action": {
      "label": "GET"
    },
    "mobile": {
      "description": "Mobile Wallet"
    },
    "extension": {
      "description": "Browser Extension"
    },
    "mobile_and_extension": {
      "description": "Mobile Wallet and Extension"
    },
    "mobile_and_desktop": {
      "description": "Mobile and Desktop Wallet"
    },
    "looking_for": {
      "title": "Not what you're looking for?",
      "mobile": {
        "description": "Select a wallet on the main screen to get started with a different wallet provider."
      },
      "desktop": {
        "compact_description": "Select a wallet on the main screen to get started with a different wallet provider.",
        "wide_description": "Select a wallet on the left to get started with a different wallet provider."
      }
    }
  },

  "get_options": {
    "title": "Get started with %{wallet}",
    "short_title": "Get %{wallet}",
    "mobile": {
      "title": "%{wallet} for Mobile",
      "description": "Use the mobile wallet to explore the world of Ethereum.",
      "download": {
        "label": "Get the app"
      }
    },
    "extension": {
      "title": "%{wallet} for %{browser}",
      "description": "Access your wallet right from your favorite web browser.",
      "download": {
        "label": "Add to %{browser}"
      }
    },
    "desktop": {
      "title": "%{wallet} for %{platform}",
      "description": "Access your wallet natively from your powerful desktop.",
      "download": {
        "label": "Add to %{platform}"
      }
    }
  },

  "get_mobile": {
    "title": "Install %{wallet}",
    "description": "Scan with your phone to download on iOS or Android",
    "continue": {
      "label": "Continue"
    }
  },

  "get_instructions": {
    "mobile": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "extension": {
      "refresh": {
        "label": "Refresh"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "desktop": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    }
  },

  "chains": {
    "title": "Switch Networks",
    "wrong_network": "Wrong network detected, switch or disconnect to continue.",
    "confirm": "Confirm in Wallet",
    "switching_not_supported": "Your wallet does not support switching networks from %{appName}. Try switching networks from within your wallet instead.",
    "switching_not_supported_fallback": "Your wallet does not support switching networks from this app. Try switching networks from within your wallet instead.",
    "disconnect": "Disconnect",
    "connected": "Connected"
  },

  "profile": {
    "disconnect": {
      "label": "Disconnect"
    },
    "copy_address": {
      "label": "Copy Address",
      "copied": "Copied!"
    },
    "explorer": {
      "label": "View more on explorer"
    },
    "transactions": {
      "description": "%{appName} transactions will appear here...",
      "description_fallback": "Your transactions will appear here...",
      "recent": {
        "title": "Recent Transactions"
      },
      "clear": {
        "label": "Clear All"
      }
    }
  },

  "wallet_connectors": {
    "argent": {
      "qr_code": {
        "step1": {
          "description": "Put Argent on your home screen for faster access to your wallet.",
          "title": "Open the Argent app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "berasig": {
      "extension": {
        "step1": {
          "title": "Install the BeraSig extension",
          "description": "We recommend pinning BeraSig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "best": {
      "qr_code": {
        "step1": {
          "title": "Open the Best Wallet app",
          "description": "Add Best Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bifrost": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bifrost Wallet on your home screen for quicker access.",
          "title": "Open the Bifrost Wallet app"
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "bitget": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bitget Wallet on your home screen for quicker access.",
          "title": "Open the Bitget Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Bitget Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitget Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitski": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Bitski to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitski extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitverse": {
      "qr_code": {
        "step1": {
          "title": "Open the Bitverse Wallet app",
          "description": "Add Bitverse Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bloom": {
      "desktop": {
        "step1": {
          "title": "Open the Bloom Wallet app",
          "description": "We recommend putting Bloom Wallet on your home screen for quicker access."
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you have a wallet, click on Connect to connect via Bloom. A connection prompt in the app will appear for you to confirm the connection.",
          "title": "Click on Connect"
        }
      }
    },

    "bybit": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bybit on your home screen for faster access to your wallet.",
          "title": "Open the Bybit app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Bybit Wallet for easy access.",
          "title": "Install the Bybit Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Bybit Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "binance": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Binance on your home screen for faster access to your wallet.",
          "title": "Open the Binance app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "coin98": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coin98 Wallet on your home screen for faster access to your wallet.",
          "title": "Open the Coin98 Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Coin98 Wallet for easy access.",
          "title": "Install the Coin98 Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Coin98 Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "coinbase": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coinbase Wallet on your home screen for quicker access.",
          "title": "Open the Coinbase Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Coinbase Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Coinbase Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "compass": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Compass Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Compass Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "core": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Core on your home screen for faster access to your wallet.",
          "title": "Open the Core app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Core to your taskbar for quicker access to your wallet.",
          "title": "Install the Core extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "fox": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting FoxWallet on your home screen for quicker access.",
          "title": "Open the FoxWallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "frontier": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Frontier Wallet on your home screen for quicker access.",
          "title": "Open the Frontier Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Frontier Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Frontier Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "im_token": {
      "qr_code": {
        "step1": {
          "title": "Open the imToken app",
          "description": "Put imToken app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "iopay": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting ioPay on your home screen for faster access to your wallet.",
          "title": "Open the ioPay app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "kaikas": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaikas to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaikas extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaikas app",
          "description": "Put Kaikas app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kaia": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaia to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaia extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaia app",
          "description": "Put Kaia app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kraken": {
      "qr_code": {
        "step1": {
          "title": "Open the Kraken Wallet app",
          "description": "Add Kraken Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "kresus": {
      "qr_code": {
        "step1": {
          "title": "Open the Kresus Wallet app",
          "description": "Add Kresus Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "magicEden": {
      "extension": {
        "step1": {
          "title": "Install the Magic Eden extension",
          "description": "We recommend pinning Magic Eden to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "metamask": {
      "qr_code": {
        "step1": {
          "title": "Open the MetaMask app",
          "description": "We recommend putting MetaMask on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the MetaMask extension",
          "description": "We recommend pinning MetaMask to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "nestwallet": {
      "extension": {
        "step1": {
          "title": "Install the NestWallet extension",
          "description": "We recommend pinning NestWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "okx": {
      "qr_code": {
        "step1": {
          "title": "Open the OKX Wallet app",
          "description": "We recommend putting OKX Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the OKX Wallet extension",
          "description": "We recommend pinning OKX Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "omni": {
      "qr_code": {
        "step1": {
          "title": "Open the Omni app",
          "description": "Add Omni to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your home screen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "1inch": {
      "qr_code": {
        "step1": {
          "description": "Put 1inch Wallet on your home screen for faster access to your wallet.",
          "title": "Open the 1inch Wallet app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "token_pocket": {
      "qr_code": {
        "step1": {
          "title": "Open the TokenPocket app",
          "description": "We recommend putting TokenPocket on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the TokenPocket extension",
          "description": "We recommend pinning TokenPocket to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "trust": {
      "qr_code": {
        "step1": {
          "title": "Open the Trust Wallet app",
          "description": "Put Trust Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Trust Wallet extension",
          "description": "Click at the top right of your browser and pin Trust Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up Trust Wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "uniswap": {
      "qr_code": {
        "step1": {
          "title": "Open the Uniswap app",
          "description": "Add Uniswap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "zerion": {
      "qr_code": {
        "step1": {
          "title": "Open the Zerion app",
          "description": "We recommend putting Zerion on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Zerion extension",
          "description": "We recommend pinning Zerion to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rainbow": {
      "qr_code": {
        "step1": {
          "title": "Open the Rainbow app",
          "description": "We recommend putting Rainbow on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "You can easily backup your wallet using our backup feature on your phone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "enkrypt": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Enkrypt Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Enkrypt Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "frame": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Frame to your taskbar for quicker access to your wallet.",
          "title": "Install Frame & the companion extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "one_key": {
      "extension": {
        "step1": {
          "title": "Install the OneKey Wallet extension",
          "description": "We recommend pinning OneKey Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "paraswap": {
      "qr_code": {
        "step1": {
          "title": "Open the ParaSwap app",
          "description": "Add ParaSwap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "phantom": {
      "extension": {
        "step1": {
          "title": "Install the Phantom extension",
          "description": "We recommend pinning Phantom to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rabby": {
      "extension": {
        "step1": {
          "title": "Install the Rabby extension",
          "description": "We recommend pinning Rabby to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ronin": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Ronin Wallet on your home screen for quicker access.",
          "title": "Open the Ronin Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Ronin Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Ronin Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "ramper": {
      "extension": {
        "step1": {
          "title": "Install the Ramper extension",
          "description": "We recommend pinning Ramper to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safeheron": {
      "extension": {
        "step1": {
          "title": "Install the Core extension",
          "description": "We recommend pinning Safeheron to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "taho": {
      "extension": {
        "step1": {
          "title": "Install the Taho extension",
          "description": "We recommend pinning Taho to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "wigwam": {
      "extension": {
        "step1": {
          "title": "Install the Wigwam extension",
          "description": "We recommend pinning Wigwam to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "talisman": {
      "extension": {
        "step1": {
          "title": "Install the Talisman extension",
          "description": "We recommend pinning Talisman to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import an Ethereum Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "xdefi": {
      "extension": {
        "step1": {
          "title": "Install the XDEFI Wallet extension",
          "description": "We recommend pinning XDEFI Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "zeal": {
      "qr_code": {
        "step1": {
          "title": "Open the Zeal app",
          "description": "Add Zeal Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Zeal extension",
          "description": "We recommend pinning Zeal to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safepal": {
      "extension": {
        "step1": {
          "title": "Install the SafePal Wallet extension",
          "description": "Click at the top right of your browser and pin SafePal Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up SafePal Wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SafePal Wallet app",
          "description": "Put SafePal Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "desig": {
      "extension": {
        "step1": {
          "title": "Install the Desig extension",
          "description": "We recommend pinning Desig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "subwallet": {
      "extension": {
        "step1": {
          "title": "Install the SubWallet extension",
          "description": "We recommend pinning SubWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SubWallet app",
          "description": "We recommend putting SubWallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "clv": {
      "extension": {
        "step1": {
          "title": "Install the CLV Wallet extension",
          "description": "We recommend pinning CLV Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the CLV Wallet app",
          "description": "We recommend putting CLV Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "okto": {
      "qr_code": {
        "step1": {
          "title": "Open the Okto app",
          "description": "Add Okto to your home screen for quick access"
        },
        "step2": {
          "title": "Create an MPC Wallet",
          "description": "Create an account and generate a wallet"
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Tap the Scan QR icon at the top right and confirm the prompt to connect."
        }
      }
    },

    "ledger": {
      "desktop": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "Set up a new Ledger or connect to an existing one."
        },
        "step3": {
          "title": "Connect",
          "description": "A connection prompt will appear for you to connect your wallet."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "You can either sync with the desktop app or connect your Ledger."
        },
        "step3": {
          "title": "Scan the code",
          "description": "Tap WalletConnect then Switch to Scanner. After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "valora": {
      "qr_code": {
        "step1": {
          "title": "Open the Valora app",
          "description": "We recommend putting Valora on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "gate": {
      "qr_code": {
        "step1": {
          "title": "Open the Gate app",
          "description": "We recommend putting Gate on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Gate extension",
          "description": "We recommend pinning Gate to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "xportal": {
      "qr_code": {
        "step1": {
          "description": "Put xPortal on your home screen for faster access to your wallet.",
          "title": "Open the xPortal app"
        },
        "step2": {
          "description": "Create a wallet or import an existing one.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "mew": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting MEW Wallet on your home screen for quicker access.",
          "title": "Open the MEW Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    }
  },

  "zilpay": {
    "qr_code": {
      "step1": {
        "title": "Open the ZilPay app",
        "description": "Add ZilPay to your home screen for faster access to your wallet."
      },
      "step2": {
        "title": "Create or Import a Wallet",
        "description": "Create a new wallet or import an existing one."
      },
      "step3": {
        "title": "Tap the scan button",
        "description": "After you scan, a connection prompt will appear for you to connect your wallet."
      }
    }
  }
}
`},32005:(a,b,c)=>{"use strict";c.r(b),c.d(b,{ConnectButton:()=>eg,RainbowKitAuthenticationProvider:()=>a7,RainbowKitProvider:()=>c$,WalletButton:()=>ei,__private__:()=>ex,connectorsForWallets:()=>ek,createAuthenticationAdapter:()=>a5,cssObjectFromTheme:()=>ck,cssStringFromTheme:()=>cl,darkTheme:()=>m,getDefaultConfig:()=>eu,getDefaultWallets:()=>ev,getWalletConnectConnector:()=>em,lightTheme:()=>p,midnightTheme:()=>s,useAccountModal:()=>d9,useAddRecentTransaction:()=>ew,useChainModal:()=>ea,useConnectModal:()=>ec});var d,e='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',f={rounded:`SFRounded, ui-rounded, "SF Pro Rounded", ${e}`,system:e},g={large:{actionButton:"9999px",connectButton:"12px",modal:"24px",modalMobile:"28px"},medium:{actionButton:"10px",connectButton:"8px",modal:"16px",modalMobile:"18px"},none:{actionButton:"0px",connectButton:"0px",modal:"0px",modalMobile:"0px"},small:{actionButton:"4px",connectButton:"4px",modal:"8px",modalMobile:"8px"}},h={large:{modalOverlay:"blur(20px)"},none:{modalOverlay:"blur(0px)"},small:{modalOverlay:"blur(4px)"}},i=({borderRadius:a="large",fontStack:b="rounded",overlayBlur:c="none"})=>({blurs:{modalOverlay:h[c].modalOverlay},fonts:{body:f[b]},radii:{actionButton:g[a].actionButton,connectButton:g[a].connectButton,menuButton:g[a].connectButton,modal:g[a].modal,modalMobile:g[a].modalMobile}}),j="#1A1B1F",k={blue:{accentColor:"#3898FF",accentColorForeground:"#FFF"},green:{accentColor:"#4BD166",accentColorForeground:j},orange:{accentColor:"#FF983D",accentColorForeground:j},pink:{accentColor:"#FF7AB8",accentColorForeground:j},purple:{accentColor:"#7A70FF",accentColorForeground:"#FFF"},red:{accentColor:"#FF6257",accentColorForeground:"#FFF"}},l=k.blue,m=({accentColor:a=l.accentColor,accentColorForeground:b=l.accentColorForeground,...c}={})=>({...i(c),colors:{accentColor:a,accentColorForeground:b,actionButtonBorder:"rgba(255, 255, 255, 0.04)",actionButtonBorderMobile:"rgba(255, 255, 255, 0.08)",actionButtonSecondaryBackground:"rgba(255, 255, 255, 0.08)",closeButton:"rgba(224, 232, 255, 0.6)",closeButtonBackground:"rgba(255, 255, 255, 0.08)",connectButtonBackground:j,connectButtonBackgroundError:"#FF494A",connectButtonInnerBackground:"linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))",connectButtonText:"#FFF",connectButtonTextError:"#FFF",connectionIndicator:"#30E000",downloadBottomCardBackground:"linear-gradient(126deg, rgba(0, 0, 0, 0) 9.49%, rgba(120, 120, 120, 0.2) 71.04%), #1A1B1F",downloadTopCardBackground:"linear-gradient(126deg, rgba(120, 120, 120, 0.2) 9.49%, rgba(0, 0, 0, 0) 71.04%), #1A1B1F",error:"#FF494A",generalBorder:"rgba(255, 255, 255, 0.08)",generalBorderDim:"rgba(255, 255, 255, 0.04)",menuItemBackground:"rgba(224, 232, 255, 0.1)",modalBackdrop:"rgba(0, 0, 0, 0.5)",modalBackground:"#1A1B1F",modalBorder:"rgba(255, 255, 255, 0.08)",modalText:"#FFF",modalTextDim:"rgba(224, 232, 255, 0.3)",modalTextSecondary:"rgba(255, 255, 255, 0.6)",profileAction:"rgba(224, 232, 255, 0.1)",profileActionHover:"rgba(224, 232, 255, 0.2)",profileForeground:"rgba(224, 232, 255, 0.05)",selectedOptionBorder:"rgba(224, 232, 255, 0.1)",standby:"#FFD641"},shadows:{connectButton:"0px 4px 12px rgba(0, 0, 0, 0.1)",dialog:"0px 8px 32px rgba(0, 0, 0, 0.32)",profileDetailsAction:"0px 2px 6px rgba(37, 41, 46, 0.04)",selectedOption:"0px 2px 6px rgba(0, 0, 0, 0.24)",selectedWallet:"0px 2px 6px rgba(0, 0, 0, 0.24)",walletLogo:"0px 2px 16px rgba(0, 0, 0, 0.16)"}});m.accentColors=k;var n={blue:{accentColor:"#0E76FD",accentColorForeground:"#FFF"},green:{accentColor:"#1DB847",accentColorForeground:"#FFF"},orange:{accentColor:"#FF801F",accentColorForeground:"#FFF"},pink:{accentColor:"#FF5CA0",accentColorForeground:"#FFF"},purple:{accentColor:"#5F5AFA",accentColorForeground:"#FFF"},red:{accentColor:"#FA423C",accentColorForeground:"#FFF"}},o=n.blue,p=({accentColor:a=o.accentColor,accentColorForeground:b=o.accentColorForeground,...c}={})=>({...i(c),colors:{accentColor:a,accentColorForeground:b,actionButtonBorder:"rgba(0, 0, 0, 0.04)",actionButtonBorderMobile:"rgba(0, 0, 0, 0.06)",actionButtonSecondaryBackground:"rgba(0, 0, 0, 0.06)",closeButton:"rgba(60, 66, 66, 0.8)",closeButtonBackground:"rgba(0, 0, 0, 0.06)",connectButtonBackground:"#FFF",connectButtonBackgroundError:"#FF494A",connectButtonInnerBackground:"linear-gradient(0deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.06))",connectButtonText:"#25292E",connectButtonTextError:"#FFF",connectionIndicator:"#30E000",downloadBottomCardBackground:"linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #FFFFFF",downloadTopCardBackground:"linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #FFFFFF",error:"#FF494A",generalBorder:"rgba(0, 0, 0, 0.06)",generalBorderDim:"rgba(0, 0, 0, 0.03)",menuItemBackground:"rgba(60, 66, 66, 0.1)",modalBackdrop:"rgba(0, 0, 0, 0.3)",modalBackground:"#FFF",modalBorder:"transparent",modalText:"#25292E",modalTextDim:"rgba(60, 66, 66, 0.3)",modalTextSecondary:"rgba(60, 66, 66, 0.6)",profileAction:"#FFF",profileActionHover:"rgba(255, 255, 255, 0.5)",profileForeground:"rgba(60, 66, 66, 0.06)",selectedOptionBorder:"rgba(60, 66, 66, 0.1)",standby:"#FFD641"},shadows:{connectButton:"0px 4px 12px rgba(0, 0, 0, 0.1)",dialog:"0px 8px 32px rgba(0, 0, 0, 0.32)",profileDetailsAction:"0px 2px 6px rgba(37, 41, 46, 0.04)",selectedOption:"0px 2px 6px rgba(0, 0, 0, 0.24)",selectedWallet:"0px 2px 6px rgba(0, 0, 0, 0.12)",walletLogo:"0px 2px 16px rgba(0, 0, 0, 0.16)"}});p.accentColors=n;var q={blue:{accentColor:"#3898FF",accentColorForeground:"#FFF"},green:{accentColor:"#4BD166",accentColorForeground:"#000"},orange:{accentColor:"#FF983D",accentColorForeground:"#000"},pink:{accentColor:"#FF7AB8",accentColorForeground:"#000"},purple:{accentColor:"#7A70FF",accentColorForeground:"#FFF"},red:{accentColor:"#FF6257",accentColorForeground:"#FFF"}},r=q.blue,s=({accentColor:a=r.accentColor,accentColorForeground:b=r.accentColorForeground,...c}={})=>({...i(c),colors:{accentColor:a,accentColorForeground:b,actionButtonBorder:"rgba(255, 255, 255, 0.04)",actionButtonBorderMobile:"rgba(255, 255, 255, 0.1)",actionButtonSecondaryBackground:"rgba(255, 255, 255, 0.08)",closeButton:"rgba(255, 255, 255, 0.7)",closeButtonBackground:"rgba(255, 255, 255, 0.08)",connectButtonBackground:"#000",connectButtonBackgroundError:"#FF494A",connectButtonInnerBackground:"linear-gradient(0deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.12))",connectButtonText:"#FFF",connectButtonTextError:"#FFF",connectionIndicator:"#30E000",downloadBottomCardBackground:"linear-gradient(126deg, rgba(0, 0, 0, 0) 9.49%, rgba(120, 120, 120, 0.1) 71.04%), #050505",downloadTopCardBackground:"linear-gradient(126deg, rgba(120, 120, 120, 0.1) 9.49%, rgba(0, 0, 0, 0) 71.04%), #050505",error:"#FF494A",generalBorder:"rgba(255, 255, 255, 0.08)",generalBorderDim:"rgba(255, 255, 255, 0.04)",menuItemBackground:"rgba(255, 255, 255, 0.08)",modalBackdrop:"rgba(0, 0, 0, 0.7)",modalBackground:"#000",modalBorder:"rgba(255, 255, 255, 0.08)",modalText:"#FFF",modalTextDim:"rgba(255, 255, 255, 0.2)",modalTextSecondary:"rgba(255, 255, 255, 0.6)",profileAction:"rgba(255, 255, 255, 0.1)",profileActionHover:"rgba(255, 255, 255, 0.2)",profileForeground:"rgba(255, 255, 255, 0.06)",selectedOptionBorder:"rgba(224, 232, 255, 0.1)",standby:"#FFD641"},shadows:{connectButton:"0px 4px 12px rgba(0, 0, 0, 0.1)",dialog:"0px 8px 32px rgba(0, 0, 0, 0.32)",profileDetailsAction:"0px 2px 6px rgba(37, 41, 46, 0.04)",selectedOption:"0px 2px 6px rgba(0, 0, 0, 0.24)",selectedWallet:"0px 2px 6px rgba(0, 0, 0, 0.24)",walletLogo:"0px 2px 16px rgba(0, 0, 0, 0.16)"}});s.accentColors=q;var t=c(9424),u=c(41060),v=function(a,b){return Object.defineProperty(a,"__recipe__",{value:b,writable:!1}),a};function w(a){var{conditions:b}=a;if(!b)throw Error("Styles have no conditions");return v(function(a){if("string"==typeof a||"number"==typeof a||"boolean"==typeof a){if(!b.defaultCondition)throw Error("No default condition");return{[b.defaultCondition]:a}}if(Array.isArray(a)){if(!("responsiveArray"in b))throw Error("Responsive arrays are not supported");var c={};for(var d in b.responsiveArray)null!=a[d]&&(c[b.responsiveArray[d]]=a[d]);return c}return a},{importPath:"@vanilla-extract/sprinkles/createUtils",importName:"createNormalizeValueFn",args:[{conditions:a.conditions}]})}function x(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function y(a){for(var b=1;b<arguments.length;b++){var c=null!=arguments[b]?arguments[b]:{};b%2?x(Object(c),!0).forEach(function(b){!function(a,b,c){var d;(b="symbol"==typeof(d=function(a,b){if("object"!=typeof a||!a)return a;var c=a[Symbol.toPrimitive];if(void 0!==c){var d=c.call(a,b||"default");if("object"!=typeof d)return d;throw TypeError("@@toPrimitive must return a primitive value.")}return("string"===b?String:Number)(a)}(b,"string"))?d:String(d))in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c}(a,b,c[b])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(c)):x(Object(c)).forEach(function(b){Object.defineProperty(a,b,Object.getOwnPropertyDescriptor(c,b))})}return a}var z=a=>a,A=c(26834),B=c(14083),C=c(96530),D=c(83347),E=c(90191);var F=c(16115),G=c(92619),H=c(72295),I=c(44236),J=c(13706),K=c(45257),L=c(71791),M=c(87893),N=c(72158),O=c(88314),P=c(65177),Q=(0,c(95160).f)(),R=function(){},S=u.forwardRef(function(a,b){var c=u.useRef(null),d=u.useState({onScrollCapture:R,onWheelCapture:R,onTouchMoveCapture:R}),e=d[0],f=d[1],g=a.forwardProps,h=a.children,i=a.className,j=a.removeScrollBar,k=a.enabled,l=a.shards,m=a.sideCar,n=a.noIsolation,o=a.inert,p=a.allowPinchZoom,q=a.as,r=a.gapMode,s=(0,N.__rest)(a,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noIsolation","inert","allowPinchZoom","as","gapMode"]),t=(0,P.S)([c,b]),v=(0,N.__assign)((0,N.__assign)({},s),e);return u.createElement(u.Fragment,null,k&&u.createElement(m,{sideCar:Q,removeScrollBar:j,shards:l,noIsolation:n,inert:o,setCallbacks:f,allowPinchZoom:!!p,lockRef:c,gapMode:r}),g?u.cloneElement(u.Children.only(h),(0,N.__assign)((0,N.__assign)({},v),{ref:t})):u.createElement(void 0===q?"div":q,(0,N.__assign)({},v,{className:i,ref:t}),h))});S.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1},S.classNames={fullWidth:O.pN,zeroRight:O.Mi};var T=c(23240),U=c(7833),V=c(8197),W=!1;if("undefined"!=typeof window)try{var X=Object.defineProperty({},"passive",{get:function(){return W=!0,!0}});window.addEventListener("test",X,X),window.removeEventListener("test",X,X)}catch(a){W=!1}var Y=!!W&&{passive:!1},Z=function(a,b){if(!(a instanceof Element))return!1;var c=window.getComputedStyle(a);return"hidden"!==c[b]&&(c.overflowY!==c.overflowX||"TEXTAREA"===a.tagName||"visible"!==c[b])},$=function(a,b){var c=b.ownerDocument,d=b;do{if("undefined"!=typeof ShadowRoot&&d instanceof ShadowRoot&&(d=d.host),_(a,d)){var e=aa(a,d);if(e[1]>e[2])return!0}d=d.parentNode}while(d&&d!==c.body);return!1},_=function(a,b){return"v"===a?Z(b,"overflowY"):Z(b,"overflowX")},aa=function(a,b){return"v"===a?[b.scrollTop,b.scrollHeight,b.clientHeight]:[b.scrollLeft,b.scrollWidth,b.clientWidth]},ab=function(a,b,c,d,e){var f,g=(f=window.getComputedStyle(b).direction,"h"===a&&"rtl"===f?-1:1),h=g*d,i=c.target,j=b.contains(i),k=!1,l=h>0,m=0,n=0;do{var o=aa(a,i),p=o[0],q=o[1]-o[2]-g*p;(p||q)&&_(a,i)&&(m+=q,n+=p),i=i instanceof ShadowRoot?i.host:i.parentNode}while(!j&&i!==document.body||j&&(b.contains(i)||b===i));return l&&(e&&1>Math.abs(m)||!e&&h>m)?k=!0:!l&&(e&&1>Math.abs(n)||!e&&-h>n)&&(k=!0),k},ac=function(a){return"changedTouches"in a?[a.changedTouches[0].clientX,a.changedTouches[0].clientY]:[0,0]},ad=function(a){return[a.deltaX,a.deltaY]},ae=function(a){return a&&"current"in a?a.current:a},af=0,ag=[];let ah=(0,T.m)(Q,function(a){var b=u.useRef([]),c=u.useRef([0,0]),d=u.useRef(),e=u.useState(af++)[0],f=u.useState(V.T0)[0],g=u.useRef(a);u.useEffect(function(){g.current=a},[a]),u.useEffect(function(){if(a.inert){document.body.classList.add("block-interactivity-".concat(e));var b=(0,N.__spreadArray)([a.lockRef.current],(a.shards||[]).map(ae),!0).filter(Boolean);return b.forEach(function(a){return a.classList.add("allow-interactivity-".concat(e))}),function(){document.body.classList.remove("block-interactivity-".concat(e)),b.forEach(function(a){return a.classList.remove("allow-interactivity-".concat(e))})}}},[a.inert,a.lockRef.current,a.shards]);var h=u.useCallback(function(a,b){if("touches"in a&&2===a.touches.length||"wheel"===a.type&&a.ctrlKey)return!g.current.allowPinchZoom;var e,f=ac(a),h=c.current,i="deltaX"in a?a.deltaX:h[0]-f[0],j="deltaY"in a?a.deltaY:h[1]-f[1],k=a.target,l=Math.abs(i)>Math.abs(j)?"h":"v";if("touches"in a&&"h"===l&&"range"===k.type)return!1;var m=$(l,k);if(!m)return!0;if(m?e=l:(e="v"===l?"h":"v",m=$(l,k)),!m)return!1;if(!d.current&&"changedTouches"in a&&(i||j)&&(d.current=e),!e)return!0;var n=d.current||e;return ab(n,b,a,"h"===n?i:j,!0)},[]),i=u.useCallback(function(a){if(ag.length&&ag[ag.length-1]===f){var c="deltaY"in a?ad(a):ac(a),d=b.current.filter(function(b){var d;return b.name===a.type&&(b.target===a.target||a.target===b.shadowParent)&&(d=b.delta,d[0]===c[0]&&d[1]===c[1])})[0];if(d&&d.should){a.cancelable&&a.preventDefault();return}if(!d){var e=(g.current.shards||[]).map(ae).filter(Boolean).filter(function(b){return b.contains(a.target)});(e.length>0?h(a,e[0]):!g.current.noIsolation)&&a.cancelable&&a.preventDefault()}}},[]),j=u.useCallback(function(a,c,d,e){var f={name:a,delta:c,target:d,should:e,shadowParent:function(a){for(var b=null;null!==a;)a instanceof ShadowRoot&&(b=a.host,a=a.host),a=a.parentNode;return b}(d)};b.current.push(f),setTimeout(function(){b.current=b.current.filter(function(a){return a!==f})},1)},[]),k=u.useCallback(function(a){c.current=ac(a),d.current=void 0},[]),l=u.useCallback(function(b){j(b.type,ad(b),b.target,h(b,a.lockRef.current))},[]),m=u.useCallback(function(b){j(b.type,ac(b),b.target,h(b,a.lockRef.current))},[]);u.useEffect(function(){return ag.push(f),a.setCallbacks({onScrollCapture:l,onWheelCapture:l,onTouchMoveCapture:m}),document.addEventListener("wheel",i,Y),document.addEventListener("touchmove",i,Y),document.addEventListener("touchstart",k,Y),function(){ag=ag.filter(function(a){return a!==f}),document.removeEventListener("wheel",i,Y),document.removeEventListener("touchmove",i,Y),document.removeEventListener("touchstart",k,Y)}},[]);var n=a.removeScrollBar,o=a.inert;return u.createElement(u.Fragment,null,o?u.createElement(f,{styles:"\n  .block-interactivity-".concat(e," {pointer-events: none;}\n  .allow-interactivity-").concat(e," {pointer-events: all;}\n")}):null,n?u.createElement(U.jp,{gapMode:a.gapMode}):null)});var ai=u.forwardRef(function(a,b){return u.createElement(S,(0,N.__assign)({},a,{ref:b,sideCar:ah}))});function aj(a){var b=a.match(/^var\((.*)\)$/);return b?b[1]:a}function ak(a,b){var c={};if("object"==typeof b)!function a(b,c){var d=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],e={};for(var f in b){var g=b[f],h=[...d,f];"string"==typeof g||"number"==typeof g||null==g?e[f]=c(g,h):"object"!=typeof g||Array.isArray(g)?console.warn('Skipping invalid key "'.concat(h.join("."),'". Should be a string, number, null or object. Received: "').concat(Array.isArray(g)?"Array":typeof g,'"')):e[f]=a(g,c,h)}return e}(b,(b,d)=>{null!=b&&(c[aj(function(a,b){var c=a;for(var d of b){if(!(d in c))throw Error("Path ".concat(b.join(" -> ")," does not exist in object"));c=c[d]}return c}(a,d))]=String(b))});else for(var d in a){var e=a[d];null!=e&&(c[aj(d)]=e)}return Object.defineProperty(c,"toString",{value:function(){return Object.keys(this).map(a=>"".concat(a,":").concat(this[a])).join(";")},writable:!1}),c}ai.classNames=S.classNames;var al=c(17952),am=c(74899),an=c(26448),ao=c(60218),ap=c(3967),aq=c(2801);let ar={newline:10,reset:27};function as(a,b){return a.toString(2).padStart(b,"0")}function at(a,b){let c=a%b;return c>=0?c:b+c}function au(a,b){return Array(a).fill(b)}function av(...a){let b=0;for(let c of a)b=Math.max(b,c.length);let c=[];for(let d=0;d<b;d++)for(let b of a)d>=b.length||c.push(b[d]);return new Uint8Array(c)}function aw(a,b,c){if(c<0||c+b.length>a.length)return!1;for(let d=0;d<b.length;d++)if(b[d]!==a[c+d])return!1;return!0}function ax(a){return{has:b=>a.includes(b),decode:b=>{if(!Array.isArray(b)||b.length&&"string"!=typeof b[0])throw Error("alphabet.decode input should be array of strings");return b.map(b=>{if("string"!=typeof b)throw Error(`alphabet.decode: not string element=${b}`);let c=a.indexOf(b);if(-1===c)throw Error(`Unknown letter: "${b}". Allowed: ${a}`);return c})},encode:b=>{if(!Array.isArray(b)||b.length&&"number"!=typeof b[0])throw Error("alphabet.encode input should be an array of numbers");return b.map(b=>{if(!Number.isSafeInteger(b))throw Error(`integer expected: ${b}`);if(b<0||b>=a.length)throw Error(`Digit index outside alphabet: ${b} (alphabet: ${a.length})`);return a[b]})}}}class ay{static size(a,b){if("number"==typeof a&&(a={height:a,width:a}),!Number.isSafeInteger(a.height)&&a.height!==1/0)throw Error(`Bitmap: invalid height=${a.height} (${typeof a.height})`);if(!Number.isSafeInteger(a.width)&&a.width!==1/0)throw Error(`Bitmap: invalid width=${a.width} (${typeof a.width})`);return void 0!==b&&(a={width:Math.min(a.width,b.width),height:Math.min(a.height,b.height)}),a}static fromString(a){let b,c=(a=a.replace(/^\n+/g,"").replace(/\n+$/g,"")).split(String.fromCharCode(ar.newline)),d=c.length,e=Array(d);for(let a of c){let c=a.split("").map(a=>{if("X"===a)return!0;if(" "===a)return!1;if("?"!==a)throw Error(`Bitmap.fromString: unknown symbol=${a}`)});if(b&&c.length!==b)throw Error(`Bitmap.fromString different row sizes: width=${b} cur=${c.length}`);b=c.length,e.push(c)}return b||(b=0),new ay({height:d,width:b},e)}data;height;width;constructor(a,b){let{height:c,width:d}=ay.size(a);this.data=b||Array.from({length:c},()=>au(d,void 0)),this.height=c,this.width=d}point(a){return this.data[a.y][a.x]}isInside(a){return 0<=a.x&&a.x<this.width&&0<=a.y&&a.y<this.height}size(a){if(!a)return{height:this.height,width:this.width};let{x:b,y:c}=this.xy(a);return{height:this.height-c,width:this.width-b}}xy(a){if("number"==typeof a&&(a={x:a,y:a}),!Number.isSafeInteger(a.x))throw Error(`Bitmap: invalid x=${a.x}`);if(!Number.isSafeInteger(a.y))throw Error(`Bitmap: invalid y=${a.y}`);return a.x=at(a.x,this.width),a.y=at(a.y,this.height),a}rect(a,b,c){let{x:d,y:e}=this.xy(a),{height:f,width:g}=ay.size(b,this.size({x:d,y:e}));for(let a=0;a<f;a++)for(let b=0;b<g;b++)this.data[e+a][d+b]="function"==typeof c?c({x:b,y:a},this.data[e+a][d+b]):c;return this}rectRead(a,b,c){return this.rect(a,b,(a,b)=>(c(a,b),b))}hLine(a,b,c){return this.rect(a,{width:b,height:1},c)}vLine(a,b,c){return this.rect(a,{width:1,height:b},c)}border(a=2,b){let c=this.height+2*a,d=this.width+2*a,e=au(a,b),f=Array.from({length:a},()=>au(d,b));return new ay({height:c,width:d},[...f,...this.data.map(a=>[...e,...a,...e]),...f])}embed(a,b){return this.rect(a,b.size(),({x:a,y:c})=>b.data[c][a])}rectSlice(a,b=this.size()){let c=new ay(ay.size(b,this.size(this.xy(a))));return this.rect(a,b,({x:a,y:b},d)=>c.data[b][a]=d),c}inverse(){let{height:a,width:b}=this;return new ay({height:b,width:a}).rect({x:0,y:0},1/0,({x:a,y:b})=>this.data[a][b])}scale(a){if(!Number.isSafeInteger(a)||a>1024)throw Error(`invalid scale factor: ${a}`);let{height:b,width:c}=this;return new ay({height:a*b,width:a*c}).rect({x:0,y:0},1/0,({x:b,y:c})=>this.data[Math.floor(c/a)][Math.floor(b/a)])}clone(){return new ay(this.size()).rect({x:0,y:0},this.size(),({x:a,y:b})=>this.data[b][a])}assertDrawn(){this.rectRead(0,1/0,(a,b)=>{if("boolean"!=typeof b)throw Error(`Invalid color type=${typeof b}`)})}toString(){return this.data.map(a=>a.map(a=>void 0===a?"?":a?"X":" ").join("")).join(String.fromCharCode(ar.newline))}toASCII(){let{height:a,width:b,data:c}=this,d="";for(let e=0;e<a;e+=2){for(let f=0;f<b;f++){let b=c[e][f],g=e+1>=a||c[e+1][f];b||g?!b&&g?d+="▀":b&&!g?d+="▄":b&&g&&(d+=" "):d+="█"}d+=String.fromCharCode(ar.newline)}return d}toTerm(){let a=String.fromCharCode(ar.reset),b=a+"[0m",c=a+"[1;47m  "+b,d=a+"[40m  "+b;return this.data.map(a=>a.map(a=>a?d:c).join("")).join(String.fromCharCode(ar.newline))}toSVG(a=!0){let b,c=`<svg viewBox="0 0 ${this.width} ${this.height}" xmlns="http://www.w3.org/2000/svg">`,d="";return this.rectRead(0,1/0,(e,f)=>{if(!f)return;let{x:g,y:h}=e;if(!a){c+=`<rect x="${g}" y="${h}" width="1" height="1" />`;return}let i=`M${g} ${h}`;if(b){let a=`m${g-b.x} ${h-b.y}`;a.length<=i.length&&(i=a)}let j=g<10?`H${g}`:"h-1";d+=`${i}h1v1${j}Z`,b=e}),a&&(c+=`<path d="${d}"/>`),c+="</svg>"}toGIF(){let a=a=>[255&a,a>>>8&255],b=[...a(this.width),...a(this.height)],c=[];this.rectRead(0,1/0,(a,b)=>c.push(+(!0===b)));let d=[71,73,70,56,55,97,...b,246,0,0,255,255,255,...au(381,0),44,0,0,0,0,...b,0,7],e=Math.floor(c.length/126);for(let a=0;a<e;a++)d.push(127,128,...c.slice(126*a,126*(a+1)).map(a=>+a));return d.push(c.length%126+1,128,...c.slice(126*e).map(a=>+a)),d.push(1,129,0,59),new Uint8Array(d)}toImage(a=!1){let{height:b,width:c}=this.size(),d=new Uint8Array(b*c*(a?3:4)),e=0;for(let f=0;f<b;f++)for(let b=0;b<c;b++){let c=255*!this.data[f][b];d[e++]=c,d[e++]=c,d[e++]=c,a||(d[e++]=255)}return{height:b,width:c,data:d}}}let az=["low","medium","quartile","high"],aA=["numeric","alphanumeric","byte","kanji","eci"],aB=[26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706],aC={low:[7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],medium:[10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],quartile:[13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],high:[17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]},aD={low:[1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],medium:[1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],quartile:[1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],high:[1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]},aE={size:{encode:a=>21+4*(a-1),decode:a=>(a-17)/4},sizeType:a=>Math.floor((a+7)/17),alignmentPatterns(a){if(1===a)return[];let b=aE.size.encode(a)-6-1,c=b-6,d=Math.ceil(c/28),e=Math.floor(c/d);e%2?e+=1:c%d*2>=d&&(e+=2);let f=[6];for(let a=1;a<d;a++)f.push(b-(d-a)*e);return f.push(b),f},ECCode:{low:1,medium:0,quartile:3,high:2},formatMask:21522,formatBits(a,b){let c=aE.ECCode[a]<<3|b,d=c;for(let a=0;a<10;a++)d=d<<1^(d>>9)*1335;return(c<<10|d)^aE.formatMask},versionBits(a){let b=a;for(let a=0;a<12;a++)b=b<<1^(b>>11)*7973;return a<<12|b},alphabet:{numeric:ax("0123456789"),alphanumerc:ax("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:")},lengthBits:(a,b)=>({numeric:[10,12,14],alphanumeric:[9,11,13],byte:[8,16,16],kanji:[8,10,12],eci:[0,0,0]})[b][aE.sizeType(a)],modeBits:{numeric:"0001",alphanumeric:"0010",byte:"0100",kanji:"1000",eci:"0111"},capacity(a,b){let c=aB[a-1],d=aC[b][a-1],e=aD[b][a-1],f=Math.floor(c/e)-d,g=e-c%e;return{words:d,numBlocks:e,shortBlocks:g,blockLen:f,capacity:(c-d*e)*8,total:(d+f)*e+e-g}}},aF=[(a,b)=>(a+b)%2==0,(a,b)=>b%2==0,(a,b)=>a%3==0,(a,b)=>(a+b)%3==0,(a,b)=>(Math.floor(b/2)+Math.floor(a/3))%2==0,(a,b)=>a*b%2+a*b%3==0,(a,b)=>(a*b%2+a*b%3)%2==0,(a,b)=>((a+b)%2+a*b%3)%2==0],aG={tables:(a=>{let b=au(256,0),c=au(256,0);for(let d=0,e=1;d<256;d++)b[d]=e,c[e]=d,256&(e<<=1)&&(e^=a);return{exp:b,log:c}})(285),exp:a=>aG.tables.exp[a],log(a){if(0===a)throw Error(`GF.log: invalid arg=${a}`);return aG.tables.log[a]%255},mul:(a,b)=>0===a||0===b?0:aG.tables.exp[(aG.tables.log[a]+aG.tables.log[b])%255],add:(a,b)=>a^b,pow:(a,b)=>aG.tables.exp[aG.tables.log[a]*b%255],inv(a){if(0===a)throw Error(`GF.inverse: invalid arg=${a}`);return aG.tables.exp[255-aG.tables.log[a]]},polynomial(a){if(0==a.length)throw Error("GF.polymomial: invalid length");if(0!==a[0])return a;let b=0;for(;b<a.length-1&&0==a[b];b++);return a.slice(b)},monomial(a,b){if(a<0)throw Error(`GF.monomial: invalid degree=${a}`);if(0==b)return[0];let c=au(a+1,0);return c[0]=b,aG.polynomial(c)},degree:a=>a.length-1,coefficient:(a,b)=>a[aG.degree(a)-b],mulPoly(a,b){if(0===a[0]||0===b[0])return[0];let c=au(a.length+b.length-1,0);for(let d=0;d<a.length;d++)for(let e=0;e<b.length;e++)c[d+e]=aG.add(c[d+e],aG.mul(a[d],b[e]));return aG.polynomial(c)},mulPolyScalar(a,b){if(0==b)return[0];if(1==b)return a;let c=au(a.length,0);for(let d=0;d<a.length;d++)c[d]=aG.mul(a[d],b);return aG.polynomial(c)},mulPolyMonomial(a,b,c){if(b<0)throw Error("GF.mulPolyMonomial: invalid degree");if(0==c)return[0];let d=au(a.length+b,0);for(let b=0;b<a.length;b++)d[b]=aG.mul(a[b],c);return aG.polynomial(d)},addPoly(a,b){if(0===a[0])return b;if(0===b[0])return a;let c=a,d=b;c.length>d.length&&([c,d]=[d,c]);let e=au(d.length,0),f=d.length-c.length,g=d.slice(0,f);for(let a=0;a<g.length;a++)e[a]=g[a];for(let a=f;a<d.length;a++)e[a]=aG.add(c[a-f],d[a]);return aG.polynomial(e)},remainderPoly(a,b){let c=Array.from(a);for(let d=0;d<a.length-b.length+1;d++){let a=c[d];if(0!==a)for(let e=1;e<b.length;e++)0!==b[e]&&(c[d+e]=aG.add(c[d+e],aG.mul(b[e],a)))}return c.slice(a.length-b.length+1,c.length)},divisorPoly(a){let b=[1];for(let c=0;c<a;c++)b=aG.mulPoly(b,[1,aG.pow(2,c)]);return b},evalPoly(a,b){if(0==b)return aG.coefficient(a,0);let c=a[0];for(let d=1;d<a.length;d++)c=aG.add(aG.mul(b,c),a[d]);return c},euclidian(a,b,c){aG.degree(a)<aG.degree(b)&&([a,b]=[b,a]);let d=a,e=b,f=[0],g=[1];for(;2*aG.degree(e)>=c;){let a=d,b=f;if(d=e,f=g,0===d[0])throw Error("rLast[0] === 0");e=a;let c=[0],h=aG.inv(d[0]);for(;aG.degree(e)>=aG.degree(d)&&0!==e[0];){let a=aG.degree(e)-aG.degree(d),b=aG.mul(e[0],h);c=aG.addPoly(c,aG.monomial(a,b)),e=aG.addPoly(e,aG.mulPolyMonomial(d,a,b))}if(c=aG.mulPoly(c,f),g=aG.addPoly(c,b),aG.degree(e)>=aG.degree(d))throw Error(`Division failed r: ${e}, rLast: ${d}`)}let h=aG.coefficient(g,0);if(0==h)throw Error("sigmaTilde(0) was zero");let i=aG.inv(h);return[aG.mulPolyScalar(g,i),aG.mulPolyScalar(e,i)]}};function aH(a,b,c,d){let e="",f=c.length;if("numeric"===d){let a=aE.alphabet.numeric.decode(c.split("")),b=a.length;for(let c=0;c<b-2;c+=3)e+=as(100*a[c]+10*a[c+1]+a[c+2],10);b%3==1?e+=as(a[b-1],4):b%3==2&&(e+=as(10*a[b-2]+a[b-1],7))}else if("alphanumeric"===d){let a=aE.alphabet.alphanumerc.decode(c.split("")),b=a.length;for(let c=0;c<b-1;c+=2)e+=as(45*a[c]+a[c+1],11);b%2==1&&(e+=as(a[b-1],6))}else if("byte"===d){let a=function(a){if("string"!=typeof a)throw Error(`utf8ToBytes expected string, got ${typeof a}`);return new Uint8Array(new TextEncoder().encode(a))}(c);f=a.length,e=Array.from(a).map(a=>as(a,8)).join("")}else throw Error("encode: unsupported type");let{capacity:g}=aE.capacity(a,b),h=as(f,aE.lengthBits(a,d)),i=aE.modeBits[d]+h+e;if(i.length>g)throw Error("Capacity overflow");(i+="0".repeat(Math.min(4,Math.max(0,g-i.length)))).length%8&&(i+="0".repeat(8-i.length%8));let j="1110110000010001";for(let a=0;i.length!==g;a++)i+=j[a%j.length];let k=Uint8Array.from(i.match(/(.{8})/g).map(a=>Number(`0b${a}`)));return(function(a,b){let{words:c,shortBlocks:d,numBlocks:e,blockLen:f,total:g}=aE.capacity(a,b),h={encode(a){let b=aG.divisorPoly(c),d=Array.from(a);return d.push(...b.slice(0,-1).fill(0)),Uint8Array.from(aG.remainderPoly(d,b))},decode(a){let b=a.slice(),d=aG.polynomial(Array.from(a)),e=au(c,0),f=!1;for(let a=0;a<c;a++){let b=aG.evalPoly(d,aG.exp(a));e[e.length-1-a]=b,0!==b&&(f=!0)}if(!f)return b;e=aG.polynomial(e);let g=aG.monomial(c,1),[h,i]=aG.euclidian(g,e,c),j=au(aG.degree(h),0),k=0;for(let a=1;a<256&&k<j.length;a++)0===aG.evalPoly(h,a)&&(j[k++]=aG.inv(a));if(k!==j.length)throw Error("RS.decode: invalid errors number");for(let a=0;a<j.length;a++){let c=b.length-1-aG.log(j[a]);if(c<0)throw Error("RS.decode: invalid error location");let d=aG.inv(j[a]),e=1;for(let b=0;b<j.length;b++)a!==b&&(e=aG.mul(e,aG.add(1,aG.mul(j[b],d))));b[c]=aG.add(b[c],aG.mul(aG.evalPoly(i,d),aG.inv(e)))}return b}};return{encode(a){let b=[],c=[];for(let g=0;g<e;g++){let e=f+ +!(g<d);b.push(a.subarray(0,e)),c.push(h.encode(a.subarray(0,e))),a=a.subarray(e)}let g=av(...b),i=av(...c),j=new Uint8Array(g.length+i.length);return j.set(g),j.set(i,g.length),j},decode(a){if(a.length!==g)throw Error(`interleave.decode: len(data)=${a.length}, total=${g}`);let b=[];for(let a=0;a<e;a++){let e=a<d;b.push(new Uint8Array(c+f+ +!e))}let i=0;for(let c=0;c<f;c++)for(let d=0;d<e;d++)b[d][c]=a[i++];for(let c=d;c<e;c++)b[c][f]=a[i++];for(let g=f;g<f+c;g++)for(let c=0;c<e;c++){let e=c<d;b[c][g+ +!e]=a[i++]}let j=[];for(let a of b)j.push(...Array.from(h.decode(a)).slice(0,-c));return Uint8Array.from(j)}}})(a,b).encode(k)}function aI(a,b,c,d,e=!1){let f=function(a,b,c,d=!1){let e=aE.size.encode(a),f=new ay(e+2),g=new ay(3).rect(0,3,!0).border(1,!1).border(1,!0).border(1,!1);f=(f=f.embed(0,g).embed({x:-g.width,y:0},g).embed({x:0,y:-g.height},g)).rectSlice(1,e);let h=new ay(1).rect(0,1,!0).border(1,!1).border(1,!0),i=aE.alignmentPatterns(a);for(let a of i)for(let b of i)void 0===f.data[a][b]&&f.embed({x:b-2,y:a-2},h);f=f.hLine({x:0,y:6},1/0,({x:a},b)=>void 0===b?a%2==0:b).vLine({x:6,y:0},1/0,({y:a},b)=>void 0===b?a%2==0:b);{let a=aE.formatBits(b,c),g=b=>!d&&(a>>b&1)==1;for(let a=0;a<6;a++)f.data[a][8]=g(a);for(let a=6;a<8;a++)f.data[a+1][8]=g(a);for(let a=8;a<15;a++)f.data[e-15+a][8]=g(a);for(let a=0;a<8;a++)f.data[8][e-a-1]=g(a);for(let a=8;a<9;a++)f.data[8][15-a-1+1]=g(a);for(let a=9;a<15;a++)f.data[8][15-a-1]=g(a);f.data[e-8][8]=!d}if(a>=7){let b=aE.versionBits(a);for(let a=0;a<18;a+=1){let c=!d&&(b>>a&1)==1,g=Math.floor(a/3),h=a%3+e-8-3;f.data[g][h]=c,f.data[h][g]=c}}return f}(a,b,d,e),g=0,h=8*c.length;if(!function(a,b,c){let d=a.height,e=aF[b],f=-1,g=d-1;for(let b=d-1;b>0;b-=2){for(6==b&&(b=5);;g+=f){for(let d=0;d<2;d+=1){let f=b-d;void 0===a.data[g][f]&&c(f,g,e(f,g))}if(g+f<0||g+f>=d)break}f=-f}}(f,d,(a,b,d)=>{let e=!1;g<h&&(e=(c[g>>>3]>>(7-g&7)&1)!=0,g++),f.data[b][a]=e!==d}),g!==h)throw Error("QR: bytes left after draw");return f}function aJ(a){let{arena:b,...c}=a;return(0,aq.jsxs)(aJ.Root,{...c,children:[(0,aq.jsx)(aJ.Finder,{}),(0,aq.jsx)(aJ.Cells,{}),b&&(0,aq.jsx)(aJ.Arena,{children:"string"==typeof b?(0,aq.jsx)("img",{alt:"Arena",src:b,style:{borderRadius:1,height:"100%",objectFit:"cover",width:"100%"}}):b})]})}!function(a){function b(b){let{children:c,size:d="100%",value:e,version:f,...g}=b,h=u.useMemo(()=>(u.Children.map(c,a=>u.isValidElement(a)&&"string"!=typeof a.type&&"displayName"in a.type&&"Arena"===a.type.displayName||null)??[]).some(Boolean),[c]),i=u.useMemo(()=>{let a=b.errorCorrection;return h&&"low"===a&&(a="medium"),function(a,b={}){let{errorCorrection:c,version:d}=b,e=function(a,b="raw",c={}){let d=void 0!==c.ecc?c.ecc:"medium";if(!az.includes(d))throw Error(`Invalid error correction mode=${d}. Expected: ${az}`);let e=void 0!==c.encoding?c.encoding:function(a){let b="numeric";for(let c of a)if(!aE.alphabet.numeric.has(c)&&(b="alphanumeric",!aE.alphabet.alphanumerc.has(c)))return"byte";return b}(a);if(!aA.includes(e))throw Error(`Encoding: invalid mode=${e}. Expected: ${aA}`);if("kanji"===e||"eci"===e)throw Error(`Encoding: ${e} is not supported (yet?).`);void 0!==c.mask&&function(a){if(![0,1,2,3,4,5,6,7].includes(a)||!aF[a])throw Error(`Invalid mask=${a}. Expected number [0..7]`)}(c.mask);let f=c.version,g,h=Error("Unknown error");if(void 0!==f){var i=f;if(!Number.isSafeInteger(i)||i<1||i>40)throw Error(`Invalid version=${i}. Expected number [1..40]`);g=aH(f,d,a,e)}else for(let b=1;b<=40;b++)try{g=aH(b,d,a,e),f=b;break}catch(a){h=a}if(!f||!g)throw h;let j=function(a,b,c,d){if(void 0===d){let e,f,g=(f=1/0,{add(a,b){a>=f||(e=b,f=a)},get:()=>e,score:()=>f});for(let d=0;d<aF.length;d++)g.add(function(a){let b=a.inverse(),c=a=>{let b=0;for(let c=0,d=1,e;c<a.length;c++)(e!==a[c]||(d++,c===a.length-1))&&(d>=5&&(b+=3+(d-5)),e=a[c],d=1);return b},d=0;a.data.forEach(a=>d+=c(a)),b.data.forEach(a=>d+=c(a));let e=0,f=a.data,g=a.width-1,h=a.height-1;for(let a=0;a<g;a++)for(let b=0;b<h;b++){let c=a+1,d=b+1;f[a][b]===f[c][b]&&f[c][b]===f[a][d]&&f[c][b]===f[c][d]&&(e+=3)}let i=a=>{let b=[!0,!1,!0,!0,!0,!1,!0],c=[!1,!1,!1,!1],d=[...b,...c],e=[...c,...b],f=0;for(let b=0;b<a.length;b++)aw(a,d,b)&&(f+=40),aw(a,e,b)&&(f+=40);return f},j=0;for(let b of a.data)j+=i(b);for(let a of b.data)j+=i(a);let k=0;a.rectRead(0,1/0,(a,b)=>k+=+!!b);let l=10*Math.floor(Math.abs(k/(a.height*a.width)*100-50)/5);return d+e+j+l}(aI(a,b,c,d,!0)),d);d=g.get()}if(void 0===d)throw Error("Cannot find mask");return aI(a,b,c,d)}(f,d,g,c.mask);j.assertDrawn();let k=void 0===c.border?2:c.border;if(!Number.isSafeInteger(k))throw Error(`invalid border type=${typeof k}`);if(j=j.border(k,!1),void 0!==c.scale&&(j=j.scale(c.scale)),"raw"===b)return j.data;if("ascii"===b)return j.toASCII();if("svg"===b)return j.toSVG(c.optimize);if("gif"===b)return j.toGIF();if("term"===b)return j.toTerm();else throw Error(`Unknown output: ${b}`)}(a,"raw",{border:0,ecc:c,scale:1,version:d});return{edgeLength:e.length,finderLength:7,grid:e,value:a}}(e,{errorCorrection:a,version:f})},[e,h,b.errorCorrection,f]),j=+i.edgeLength,k=i.finderLength/2,l=h?Math.floor(j/4):0,m=u.useMemo(()=>({arenaSize:l,cellSize:1,edgeSize:j,qrcode:i,finderSize:k}),[l,j,i,k]);return(0,aq.jsx)(a.Context.Provider,{value:m,children:(0,aq.jsxs)("svg",{...g,width:d,height:d,viewBox:`0 0 ${j} ${j}`,xmlns:"http://www.w3.org/2000/svg",children:[(0,aq.jsx)("title",{children:"QR Code"}),c]})})}function c(b){let{className:c,fill:d,innerClassName:e,radius:f=.25}=b,{cellSize:g,edgeSize:h,finderSize:i}=u.useContext(a.Context);function j({position:a}){let b=i-(i-g)-g/2;"top-right"===a&&(b=h-i-(i-g)-g/2);let j=i-(i-g)-g/2;"bottom-left"===a&&(j=h-i-(i-g)-g/2);let k=i-1.5*g;"top-right"===a&&(k=h-i-1.5*g);let l=i-1.5*g;return"bottom-left"===a&&(l=h-i-1.5*g),(0,aq.jsxs)(aq.Fragment,{children:[(0,aq.jsx)("rect",{className:c,stroke:d??"currentColor",fill:"transparent",x:b,y:j,width:g+(i-g)*2,height:g+(i-g)*2,rx:2*f*(i-g),ry:2*f*(i-g),strokeWidth:g}),(0,aq.jsx)("rect",{className:e,fill:d??"currentColor",x:k,y:l,width:3*g,height:3*g,rx:2*f*g,ry:2*f*g})]})}return(0,aq.jsxs)(aq.Fragment,{children:[(0,aq.jsx)(j,{position:"top-left"}),(0,aq.jsx)(j,{position:"top-right"}),(0,aq.jsx)(j,{position:"bottom-left"})]})}function d(b){let{className:c,fill:d="currentColor",inset:e=!0,radius:f=1}=b,{arenaSize:g,cellSize:h,qrcode:i}=u.useContext(a.Context),{edgeLength:j,finderLength:k}=i,l=u.useMemo(()=>{let a="";for(let b=0;b<i.grid.length;b++){let c=i.grid[b];if(c)for(let d=0;d<c.length;d++){if(!c[d])continue;let i=j/2-g/2,l=i+g;if(b>=i&&b<=l&&d>=i&&d<=l)continue;let m=b<k&&d<k,n=b<k&&d>=j-k,o=b>=j-k&&d<k;if(m||n||o)continue;let p=e?.1*h:0,q=(h-2*p)/2,r=d*h+h/2,s=b*h+h/2,t=r-q,u=r+q,v=s-q,w=s+q,x=f*q;a+=`M ${t+x},${v} L ${u-x},${v} A ${x},${x} 0 0,1 ${u},${v+x} L ${u},${w-x} A ${x},${x} 0 0,1 ${u-x},${w} L ${t+x},${w} A ${x},${x} 0 0,1 ${t},${w-x} L ${t},${v+x} A ${x},${x} 0 0,1 ${t+x},${v} z`}}return a},[g,h,j,k,i.grid,e,f]);return(0,aq.jsx)("path",{className:c,d:l,fill:d})}function e(b){let{children:c}=b,{arenaSize:d,cellSize:e,edgeSize:f}=u.useContext(a.Context),g=Math.ceil(f/2-d/2),h=d+d%2;return(0,aq.jsx)("foreignObject",{x:g,y:g,width:h,height:h,children:(0,aq.jsx)("div",{style:{alignItems:"center",display:"flex",fontSize:1,justifyContent:"center",height:"100%",overflow:"hidden",width:"100%",padding:e/2,boxSizing:"border-box"},children:c})})}a.Context=u.createContext(null),a.Root=b,(b=a.Root||(a.Root={})).displayName="Root",a.Finder=c,(c=a.Finder||(a.Finder={})).displayName="Finder",a.Cells=d,(d=a.Cells||(a.Cells={})).displayName="Cells",a.Arena=e,(e=a.Arena||(a.Arena={})).displayName="Arena"}(aJ||(aJ={}));var aK=c(29171),aL=c(52732),aM=c(40272),aN=c(51447);function aO(a){let{chain:b}=a,c=b.rpcUrls.default.http[0];if(!a.transports)return[c];let d=a.transports?.[b.id]?.({chain:b});return(d?.value?.transports||[d]).map(({value:a})=>a?.url||c)}var aP=c(16840),aQ=c(74576),aR=c(39049);function aS(a){let b,d,e,f,g,h,i,j,k=a.isNewChainsStale??!0;return(0,aM.U)(l=>({id:"walletConnect",name:"WalletConnect",type:aS.type,async setup(){let a=await this.getProvider().catch(()=>null);a&&(g||(g=this.onConnect.bind(this),a.on("connect",g)),i||(i=this.onSessionDelete.bind(this),a.on("session_delete",i)))},async connect({chainId:a,...b}={}){try{let c=await this.getProvider();if(!c)throw new aN.N;h||(h=this.onDisplayUri,c.on("display_uri",h));let d=a;if(!d){let a=await l.storage?.getItem("state")??{};d=l.chains.some(b=>b.id===a.chainId)?a.chainId:l.chains[0]?.id}if(!d)throw Error("No chains found on connector.");let k=await this.isChainsStale();if(c.session&&k&&await c.disconnect(),!c.session||k){let a=l.chains.filter(a=>a.id!==d).map(a=>a.id);await c.connect({optionalChains:[d,...a],..."pairingTopic"in b?{pairingTopic:b.pairingTopic}:{}}),this.setRequestedChainsIds(l.chains.map(a=>a.id))}let m=(await c.enable()).map(a=>(0,aQ.b)(a)),n=await this.getChainId();if(a&&n!==a){let b=await this.switchChain({chainId:a}).catch(a=>{if(a.code===an.vx.code&&a.cause?.message!=="Missing or invalid. request() method: wallet_addEthereumChain")throw a;return{id:n}});n=b?.id??n}return h&&(c.removeListener("display_uri",h),h=void 0),g&&(c.removeListener("connect",g),g=void 0),e||(e=this.onAccountsChanged.bind(this),c.on("accountsChanged",e)),f||(f=this.onChainChanged.bind(this),c.on("chainChanged",f)),j||(j=this.onDisconnect.bind(this),c.on("disconnect",j)),i||(i=this.onSessionDelete.bind(this),c.on("session_delete",i)),{accounts:m,chainId:n}}catch(a){if(/(user rejected|connection request reset)/i.test(a?.message))throw new an.vx(a);throw a}},async disconnect(){let a=await this.getProvider();try{await a?.disconnect()}catch(a){if(!/No matching key/i.test(a.message))throw a}finally{f&&(a?.removeListener("chainChanged",f),f=void 0),j&&(a?.removeListener("disconnect",j),j=void 0),g||(g=this.onConnect.bind(this),a?.on("connect",g)),e&&(a?.removeListener("accountsChanged",e),e=void 0),i&&(a?.removeListener("session_delete",i),i=void 0),this.setRequestedChainsIds([])}},async getAccounts(){return(await this.getProvider()).accounts.map(a=>(0,aQ.b)(a))},async getProvider(){async function e(){let b=l.chains.map(a=>a.id);if(!b.length)return;let{EthereumProvider:d}=await Promise.all([c.e(4383),c.e(8618)]).then(c.bind(c,88618));return await d.init({...a,disableProviderPing:!0,optionalChains:b,projectId:a.projectId,rpcMap:Object.fromEntries(l.chains.map(a=>{let[b]=aO({chain:a,transports:l.transports});return[a.id,b]})),showQrModal:a.showQrModal??!0})}return b||(d||(d=e()),b=await d,b?.events.setMaxListeners(1/0)),b},async getChainId(){return(await this.getProvider()).chainId},async isAuthorized(){try{let[a,b]=await Promise.all([this.getAccounts(),this.getProvider()]);if(!a.length)return!1;if(await this.isChainsStale()&&b.session)return await b.disconnect().catch(()=>{}),!1;return!0}catch{return!1}},async switchChain({addEthereumChainParameter:a,chainId:b}){let c=await this.getProvider();if(!c)throw new aN.N;let d=l.chains.find(a=>a.id===b);if(!d)throw new an.ch(new aP.nk);try{await Promise.all([new Promise(a=>{let c=({chainId:d})=>{d===b&&(l.emitter.off("change",c),a())};l.emitter.on("change",c)}),c.request({method:"wallet_switchEthereumChain",params:[{chainId:(0,aR.cK)(b)}]})]);let a=await this.getRequestedChainsIds();return this.setRequestedChainsIds([...a,b]),d}catch(e){if(/(user rejected)/i.test(e.message))throw new an.vx(e);try{let e,f;e=a?.blockExplorerUrls?a.blockExplorerUrls:d.blockExplorers?.default.url?[d.blockExplorers?.default.url]:[],f=a?.rpcUrls?.length?a.rpcUrls:[...d.rpcUrls.default.http];let g={blockExplorerUrls:e,chainId:(0,aR.cK)(b),chainName:a?.chainName??d.name,iconUrls:a?.iconUrls,nativeCurrency:a?.nativeCurrency??d.nativeCurrency,rpcUrls:f};await c.request({method:"wallet_addEthereumChain",params:[g]});let h=await this.getRequestedChainsIds();return this.setRequestedChainsIds([...h,b]),d}catch(a){throw new an.vx(a)}}},onAccountsChanged(a){0===a.length?this.onDisconnect():l.emitter.emit("change",{accounts:a.map(a=>(0,aQ.b)(a))})},onChainChanged(a){let b=Number(a);l.emitter.emit("change",{chainId:b})},async onConnect(a){let b=Number(a.chainId),c=await this.getAccounts();l.emitter.emit("connect",{accounts:c,chainId:b})},async onDisconnect(a){this.setRequestedChainsIds([]),l.emitter.emit("disconnect");let b=await this.getProvider();e&&(b.removeListener("accountsChanged",e),e=void 0),f&&(b.removeListener("chainChanged",f),f=void 0),j&&(b.removeListener("disconnect",j),j=void 0),i&&(b.removeListener("session_delete",i),i=void 0),g||(g=this.onConnect.bind(this),b.on("connect",g))},onDisplayUri(a){l.emitter.emit("message",{type:"display_uri",data:a})},onSessionDelete(){this.onDisconnect()},getNamespaceChainsIds:()=>b?b.session?.namespaces.eip155?.accounts?.map(a=>Number.parseInt(a.split(":")[1]||""))??[]:[],async getRequestedChainsIds(){return await l.storage?.getItem(this.requestedChainsStorageKey)??[]},async isChainsStale(){if(!k)return!1;let a=l.chains.map(a=>a.id),b=this.getNamespaceChainsIds();if(b.length&&!b.some(b=>a.includes(b)))return!1;let c=await this.getRequestedChainsIds();return!a.every(a=>c.includes(a))},async setRequestedChainsIds(a){await l.storage?.setItem(this.requestedChainsStorageKey,a)},get requestedChainsStorageKey(){return`${this.id}.requestedChains`}}))}aS.type="walletConnect";var aT=c(50383);function aU(a={}){var b,d;let e,f,g,h,i,j,k,l,m;return"3"===a.version||a.headlessMode?(b=a,(0,aM.U)(a=>({id:"coinbaseWalletSDK",name:"Coinbase Wallet",rdns:"com.coinbase.wallet",type:aU.type,async connect({chainId:a}={}){try{let b=await this.getProvider(),c=(await b.request({method:"eth_requestAccounts"})).map(a=>(0,aQ.b)(a));g||(g=this.onAccountsChanged.bind(this),b.on("accountsChanged",g)),h||(h=this.onChainChanged.bind(this),b.on("chainChanged",h)),i||(i=this.onDisconnect.bind(this),b.on("disconnect",i));let d=await this.getChainId();if(a&&d!==a){let b=await this.switchChain({chainId:a}).catch(a=>{if(a.code===an.vx.code)throw a;return{id:d}});d=b?.id??d}return{accounts:c,chainId:d}}catch(a){if(/(user closed modal|accounts received is empty|user denied account)/i.test(a.message))throw new an.vx(a);throw a}},async disconnect(){let a=await this.getProvider();g&&(a.removeListener("accountsChanged",g),g=void 0),h&&(a.removeListener("chainChanged",h),h=void 0),i&&(a.removeListener("disconnect",i),i=void 0),a.disconnect(),a.close()},async getAccounts(){let a=await this.getProvider();return(await a.request({method:"eth_accounts"})).map(a=>(0,aQ.b)(a))},async getChainId(){let a=await this.getProvider();return Number(await a.request({method:"eth_chainId"}))},async getProvider(){if(!f){e=new(await (async()=>{let{default:a}=await Promise.all([c.e(4297),c.e(5944),c.e(9306)]).then(c.t.bind(c,9306,19));return"function"!=typeof a&&"function"==typeof a.default?a.default:a})())({...b,reloadOnDisconnect:!1});let d=e.walletExtension?.getChainId(),g=a.chains.find(a=>b.chainId?a.id===b.chainId:a.id===d)||a.chains[0],h=b.chainId||g?.id,i=b.jsonRpcUrl||g?.rpcUrls.default.http[0];f=e.makeWeb3Provider(i,h)}return f},async isAuthorized(){try{return!!(await this.getAccounts()).length}catch{return!1}},async switchChain({addEthereumChainParameter:b,chainId:c}){let d=a.chains.find(a=>a.id===c);if(!d)throw new an.ch(new aP.nk);let e=await this.getProvider();try{return await e.request({method:"wallet_switchEthereumChain",params:[{chainId:(0,aR.cK)(d.id)}]}),d}catch(a){if(4902===a.code)try{let a,f;a=b?.blockExplorerUrls?b.blockExplorerUrls:d.blockExplorers?.default.url?[d.blockExplorers?.default.url]:[],f=b?.rpcUrls?.length?b.rpcUrls:[d.rpcUrls.default?.http[0]??""];let g={blockExplorerUrls:a,chainId:(0,aR.cK)(c),chainName:b?.chainName??d.name,iconUrls:b?.iconUrls,nativeCurrency:b?.nativeCurrency??d.nativeCurrency,rpcUrls:f};return await e.request({method:"wallet_addEthereumChain",params:[g]}),d}catch(a){throw new an.vx(a)}throw new an.ch(a)}},onAccountsChanged(b){0===b.length?this.onDisconnect():a.emitter.emit("change",{accounts:b.map(a=>(0,aQ.b)(a))})},onChainChanged(b){let c=Number(b);a.emitter.emit("change",{chainId:c})},async onDisconnect(b){a.emitter.emit("disconnect");let c=await this.getProvider();g&&(c.removeListener("accountsChanged",g),g=void 0),h&&(c.removeListener("chainChanged",h),h=void 0),i&&(c.removeListener("disconnect",i),i=void 0)}}))):(d=a,(0,aM.U)(a=>({id:"coinbaseWalletSDK",name:"Coinbase Wallet",rdns:"com.coinbase.wallet",type:aU.type,async connect({chainId:a,...b}={}){try{let c=await this.getProvider(),d=(await c.request({method:"eth_requestAccounts",params:"instantOnboarding"in b&&b.instantOnboarding?[{onboarding:"instant"}]:[]})).map(a=>(0,aQ.b)(a));k||(k=this.onAccountsChanged.bind(this),c.on("accountsChanged",k)),l||(l=this.onChainChanged.bind(this),c.on("chainChanged",l)),m||(m=this.onDisconnect.bind(this),c.on("disconnect",m));let e=await this.getChainId();if(a&&e!==a){let b=await this.switchChain({chainId:a}).catch(a=>{if(a.code===an.vx.code)throw a;return{id:e}});e=b?.id??e}return{accounts:d,chainId:e}}catch(a){if(/(user closed modal|accounts received is empty|user denied account|request rejected)/i.test(a.message))throw new an.vx(a);throw a}},async disconnect(){let a=await this.getProvider();k&&(a.removeListener("accountsChanged",k),k=void 0),l&&(a.removeListener("chainChanged",l),l=void 0),m&&(a.removeListener("disconnect",m),m=void 0),a.disconnect(),a.close?.()},async getAccounts(){let a=await this.getProvider();return(await a.request({method:"eth_accounts"})).map(a=>(0,aQ.b)(a))},async getChainId(){let a=await this.getProvider();return Number(await a.request({method:"eth_chainId"}))},async getProvider(){if(!j){let b="string"==typeof d.preference?{options:d.preference}:{...d.preference,options:d.preference?.options??"all"},{createCoinbaseWalletSDK:e}=await c.e(4278).then(c.bind(c,74278));j=e({...d,appChainIds:a.chains.map(a=>a.id),preference:b}).getProvider()}return j},async isAuthorized(){try{return!!(await this.getAccounts()).length}catch{return!1}},async switchChain({addEthereumChainParameter:b,chainId:c}){let d=a.chains.find(a=>a.id===c);if(!d)throw new an.ch(new aP.nk);let e=await this.getProvider();try{return await e.request({method:"wallet_switchEthereumChain",params:[{chainId:(0,aR.cK)(d.id)}]}),d}catch(a){if(4902===a.code)try{let a,f;a=b?.blockExplorerUrls?b.blockExplorerUrls:d.blockExplorers?.default.url?[d.blockExplorers?.default.url]:[],f=b?.rpcUrls?.length?b.rpcUrls:[d.rpcUrls.default?.http[0]??""];let g={blockExplorerUrls:a,chainId:(0,aR.cK)(c),chainName:b?.chainName??d.name,iconUrls:b?.iconUrls,nativeCurrency:b?.nativeCurrency??d.nativeCurrency,rpcUrls:f};return await e.request({method:"wallet_addEthereumChain",params:[g]}),d}catch(a){throw new an.vx(a)}throw new an.ch(a)}},onAccountsChanged(b){0===b.length?this.onDisconnect():a.emitter.emit("change",{accounts:b.map(a=>(0,aQ.b)(a))})},onChainChanged(b){let c=Number(b);a.emitter.emit("change",{chainId:c})},async onDisconnect(b){a.emitter.emit("disconnect");let c=await this.getProvider();k&&(c.removeListener("accountsChanged",k),k=void 0),l&&(c.removeListener("chainChanged",l),l=void 0),m&&(c.removeListener("disconnect",m),m=void 0)}})))}aU.type="coinbaseWallet";var aV=c(39629),aW=c(55424),aX=c(59234);function aY(a={}){let b,d,e,f,g,h,i,j;return(0,aM.U)(k=>({id:"metaMaskSDK",name:"MetaMask",rdns:["io.metamask","io.metamask.mobile"],type:aY.type,async setup(){let a=await this.getProvider();a?.on&&(h||(h=this.onConnect.bind(this),a.on("connect",h)),f||(f=this.onAccountsChanged.bind(this),a.on("accountsChanged",f)))},async connect({chainId:c,isReconnecting:d}={}){let e=await this.getProvider();i||(i=this.onDisplayUri,e.on("display_uri",i));let k=[];d&&(k=await this.getAccounts().catch(()=>[]));try{let d,l;k?.length||(a.connectAndSign||a.connectWith?(a.connectAndSign?d=await b.connectAndSign({msg:a.connectAndSign}):a.connectWith&&(l=await b.connectWith({method:a.connectWith.method,params:a.connectWith.params})),k=await this.getAccounts()):k=(await b.connect()).map(a=>(0,aQ.b)(a)));let m=await this.getChainId();if(c&&m!==c){let a=await this.switchChain({chainId:c}).catch(a=>{if(a.code===an.vx.code)throw a;return{id:m}});m=a?.id??m}return i&&(e.removeListener("display_uri",i),i=void 0),d?e.emit("connectAndSign",{accounts:k,chainId:m,signResponse:d}):l&&e.emit("connectWith",{accounts:k,chainId:m,connectWithResponse:l}),h&&(e.removeListener("connect",h),h=void 0),f||(f=this.onAccountsChanged.bind(this),e.on("accountsChanged",f)),g||(g=this.onChainChanged.bind(this),e.on("chainChanged",g)),j||(j=this.onDisconnect.bind(this),e.on("disconnect",j)),{accounts:k,chainId:m}}catch(a){if(a.code===an.vx.code)throw new an.vx(a);if(a.code===an.qZ.code)throw new an.qZ(a);throw a}},async disconnect(){let a=await this.getProvider();g&&(a.removeListener("chainChanged",g),g=void 0),j&&(a.removeListener("disconnect",j),j=void 0),h||(h=this.onConnect.bind(this),a.on("connect",h)),await b.terminate()},async getAccounts(){let a=await this.getProvider();return(await a.request({method:"eth_accounts"})).map(a=>(0,aQ.b)(a))},async getChainId(){let a=await this.getProvider();return Number(a.getChainId()||await a?.request({method:"eth_chainId"}))},async getProvider(){async function f(){let d=await (async()=>{let{default:a}=await Promise.all([c.e(4297),c.e(4383),c.e(127)]).then(c.bind(c,127));return"function"!=typeof a&&"function"==typeof a.default?a.default:a})(),e={};for(let a of k.chains)e[(0,aR.cK)(a.id)]=aO({chain:a,transports:k.transports})?.[0];b=new d({_source:"wagmi",forceDeleteProvider:!1,forceInjectProvider:!1,injectProvider:!1,...a,readonlyRPCMap:e,dappMetadata:{...a.dappMetadata,name:a.dappMetadata?.name?a.dappMetadata?.name:"wagmi",url:a.dappMetadata?.url?a.dappMetadata?.url:"undefined"!=typeof window?window.location.origin:"https://wagmi.sh"},useDeeplink:a.useDeeplink??!0});let f=await b.init(),g=f?.activeProvider?f.activeProvider:b.getProvider();if(!g)throw new aN.N;return g}return d||(e||(e=f()),d=await e),d},async isAuthorized(){try{return!!(await (0,aV.b)(()=>(0,aW.w)(()=>this.getAccounts(),{timeout:200}),{delay:201,retryCount:3})).length}catch{return!1}},async switchChain({addEthereumChainParameter:a,chainId:b}){let c=await this.getProvider(),d=k.chains.find(a=>a.id===b);if(!d)throw new an.ch(new aP.nk);try{return await c.request({method:"wallet_switchEthereumChain",params:[{chainId:(0,aR.cK)(b)}]}),await e(),await f(b),d}catch(g){if(g.code===an.vx.code)throw new an.vx(g);if(4902===g.code||g?.data?.originalError?.code===4902)try{return await c.request({method:"wallet_addEthereumChain",params:[{blockExplorerUrls:(()=>{let{default:b,...c}=d.blockExplorers??{};return a?.blockExplorerUrls?a.blockExplorerUrls:b?[b.url,...Object.values(c).map(a=>a.url)]:void 0})(),chainId:(0,aR.cK)(b),chainName:a?.chainName??d.name,iconUrls:a?.iconUrls,nativeCurrency:a?.nativeCurrency??d.nativeCurrency,rpcUrls:a?.rpcUrls?.length?a.rpcUrls:[d.rpcUrls.default?.http[0]??""]}]}),await e(),await f(b),d}catch(a){if(a.code===an.vx.code)throw new an.vx(a);throw new an.ch(a)}throw new an.ch(g)}async function e(){await (0,aV.b)(async()=>{let a=(0,aX.ME)(await c.request({method:"eth_chainId"}));if(a!==b)throw Error("User rejected switch after adding network.");return a},{delay:50,retryCount:20})}async function f(a){await new Promise(b=>{let c=d=>{"chainId"in d&&d.chainId===a&&(k.emitter.off("change",c),b())};k.emitter.on("change",c),k.emitter.emit("change",{chainId:a})})}},async onAccountsChanged(a){if(0===a.length)if(!b.isExtensionActive())return;else this.onDisconnect();else if(k.emitter.listenerCount("connect")){let a=(await this.getChainId()).toString();this.onConnect({chainId:a})}else k.emitter.emit("change",{accounts:a.map(a=>(0,aQ.b)(a))})},onChainChanged(a){let b=Number(a);k.emitter.emit("change",{chainId:b})},async onConnect(a){let b=await this.getAccounts();if(0===b.length)return;let c=Number(a.chainId);k.emitter.emit("connect",{accounts:b,chainId:c});let d=await this.getProvider();h&&(d.removeListener("connect",h),h=void 0),f||(f=this.onAccountsChanged.bind(this),d.on("accountsChanged",f)),g||(g=this.onChainChanged.bind(this),d.on("chainChanged",g)),j||(j=this.onDisconnect.bind(this),d.on("disconnect",j))},async onDisconnect(a){let b=await this.getProvider();a&&1013===a.code&&b&&(await this.getAccounts()).length||(k.emitter.emit("disconnect"),g&&(b.removeListener("chainChanged",g),g=void 0),j&&(b.removeListener("disconnect",j),j=void 0),h||(h=this.onConnect.bind(this),b.on("connect",h)))},onDisplayUri(a){k.emitter.emit("message",{type:"display_uri",data:a})}}))}function aZ(a={}){let b,d,{shimDisconnect:e=!1}=a;return(0,aM.U)(f=>({id:"safe",name:"Safe",type:aZ.type,async connect(){let a=await this.getProvider();if(!a)throw new aN.N;let b=await this.getAccounts(),c=await this.getChainId();return d||(d=this.onDisconnect.bind(this),a.on("disconnect",d)),e&&await f.storage?.removeItem("safe.disconnected"),{accounts:b,chainId:c}},async disconnect(){let a=await this.getProvider();if(!a)throw new aN.N;d&&(a.removeListener("disconnect",d),d=void 0),e&&await f.storage?.setItem("safe.disconnected",!0)},async getAccounts(){let a=await this.getProvider();if(!a)throw new aN.N;return(await a.request({method:"eth_accounts"})).map(aQ.b)},async getProvider(){if("undefined"!=typeof window&&window?.parent!==window){if(!b){let{default:d}=await Promise.all([c.e(4468),c.e(6157)]).then(c.bind(c,36157)),e=new d(a),f=await (0,aW.w)(()=>e.safe.getInfo(),{timeout:a.unstable_getInfoTimeout??10});if(!f)throw Error("Could not load Safe information");b=new(await (async()=>{let a=await Promise.all([c.e(1874),c.e(4468),c.e(8621)]).then(c.t.bind(c,68621,19));return"function"!=typeof a.SafeAppProvider&&"function"==typeof a.default.SafeAppProvider?a.default.SafeAppProvider:a.SafeAppProvider})())(f,e)}return b}},async getChainId(){let a=await this.getProvider();if(!a)throw new aN.N;return Number(a.chainId)},async isAuthorized(){try{if(e&&await f.storage?.getItem("safe.disconnected"))return!1;return!!(await this.getAccounts()).length}catch{return!1}},onAccountsChanged(){},onChainChanged(){},onDisconnect(){f.emitter.emit("disconnect")}}))}aY.type="metaMask",aZ.type="safe";var a$=function(a){var{conditions:b}=a;if(!b)throw Error("Styles have no conditions");var c=w(a);return v(function(a,d){if("string"==typeof a||"number"==typeof a||"boolean"==typeof a){if(!b.defaultCondition)throw Error("No default condition");return d(a,b.defaultCondition)}var e=Array.isArray(a)?c(a):a,f={};for(var g in e)null!=e[g]&&(f[g]=d(e[g],g));return f},{importPath:"@vanilla-extract/sprinkles/createUtils",importName:"createMapValueFn",args:[{conditions:a.conditions}]})}({conditions:{defaultCondition:"smallScreen",conditionNames:["smallScreen","largeScreen"],responsiveArray:void 0}}),a_=w({conditions:{defaultCondition:"smallScreen",conditionNames:["smallScreen","largeScreen"],responsiveArray:void 0}}),a0=function(){return function(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];var d=Object.assign({},...b.map(a=>a.styles)),e=Object.keys(d),f=e.filter(a=>"mappings"in d[a]);return Object.assign(a=>{var b=[],c={},e=y({},a),g=!1;for(var h of f){var i=a[h];if(null!=i)for(var j of(g=!0,d[h].mappings))c[j]=i,null==e[j]&&delete e[j]}var k=g?y(y({},c),e):a;for(var l in k)if(function(){var a=k[l],c=d[l];try{if(c.mappings)return 1;if("string"==typeof a||"number"==typeof a)b.push(c.values[a].defaultClass);else if(Array.isArray(a))for(var e=0;e<a.length;e++){var f=a[e];if(null!=f){var g=c.responsiveArray[e];b.push(c.values[f].conditions[g])}}else for(var h in a){var i=a[h];null!=i&&b.push(c.values[i].conditions[h])}}catch(a){throw a}}())continue;return z(b.join(" "))},{properties:new Set(e)})}(...arguments)}({conditions:{defaultCondition:"base",conditionNames:["base","hover","active"],responsiveArray:void 0},styles:{background:{values:{accentColor:{conditions:{base:"ju367v9i",hover:"ju367v9j",active:"ju367v9k"},defaultClass:"ju367v9i"},accentColorForeground:{conditions:{base:"ju367v9l",hover:"ju367v9m",active:"ju367v9n"},defaultClass:"ju367v9l"},actionButtonBorder:{conditions:{base:"ju367v9o",hover:"ju367v9p",active:"ju367v9q"},defaultClass:"ju367v9o"},actionButtonBorderMobile:{conditions:{base:"ju367v9r",hover:"ju367v9s",active:"ju367v9t"},defaultClass:"ju367v9r"},actionButtonSecondaryBackground:{conditions:{base:"ju367v9u",hover:"ju367v9v",active:"ju367v9w"},defaultClass:"ju367v9u"},closeButton:{conditions:{base:"ju367v9x",hover:"ju367v9y",active:"ju367v9z"},defaultClass:"ju367v9x"},closeButtonBackground:{conditions:{base:"ju367va0",hover:"ju367va1",active:"ju367va2"},defaultClass:"ju367va0"},connectButtonBackground:{conditions:{base:"ju367va3",hover:"ju367va4",active:"ju367va5"},defaultClass:"ju367va3"},connectButtonBackgroundError:{conditions:{base:"ju367va6",hover:"ju367va7",active:"ju367va8"},defaultClass:"ju367va6"},connectButtonInnerBackground:{conditions:{base:"ju367va9",hover:"ju367vaa",active:"ju367vab"},defaultClass:"ju367va9"},connectButtonText:{conditions:{base:"ju367vac",hover:"ju367vad",active:"ju367vae"},defaultClass:"ju367vac"},connectButtonTextError:{conditions:{base:"ju367vaf",hover:"ju367vag",active:"ju367vah"},defaultClass:"ju367vaf"},connectionIndicator:{conditions:{base:"ju367vai",hover:"ju367vaj",active:"ju367vak"},defaultClass:"ju367vai"},downloadBottomCardBackground:{conditions:{base:"ju367val",hover:"ju367vam",active:"ju367van"},defaultClass:"ju367val"},downloadTopCardBackground:{conditions:{base:"ju367vao",hover:"ju367vap",active:"ju367vaq"},defaultClass:"ju367vao"},error:{conditions:{base:"ju367var",hover:"ju367vas",active:"ju367vat"},defaultClass:"ju367var"},generalBorder:{conditions:{base:"ju367vau",hover:"ju367vav",active:"ju367vaw"},defaultClass:"ju367vau"},generalBorderDim:{conditions:{base:"ju367vax",hover:"ju367vay",active:"ju367vaz"},defaultClass:"ju367vax"},menuItemBackground:{conditions:{base:"ju367vb0",hover:"ju367vb1",active:"ju367vb2"},defaultClass:"ju367vb0"},modalBackdrop:{conditions:{base:"ju367vb3",hover:"ju367vb4",active:"ju367vb5"},defaultClass:"ju367vb3"},modalBackground:{conditions:{base:"ju367vb6",hover:"ju367vb7",active:"ju367vb8"},defaultClass:"ju367vb6"},modalBorder:{conditions:{base:"ju367vb9",hover:"ju367vba",active:"ju367vbb"},defaultClass:"ju367vb9"},modalText:{conditions:{base:"ju367vbc",hover:"ju367vbd",active:"ju367vbe"},defaultClass:"ju367vbc"},modalTextDim:{conditions:{base:"ju367vbf",hover:"ju367vbg",active:"ju367vbh"},defaultClass:"ju367vbf"},modalTextSecondary:{conditions:{base:"ju367vbi",hover:"ju367vbj",active:"ju367vbk"},defaultClass:"ju367vbi"},profileAction:{conditions:{base:"ju367vbl",hover:"ju367vbm",active:"ju367vbn"},defaultClass:"ju367vbl"},profileActionHover:{conditions:{base:"ju367vbo",hover:"ju367vbp",active:"ju367vbq"},defaultClass:"ju367vbo"},profileForeground:{conditions:{base:"ju367vbr",hover:"ju367vbs",active:"ju367vbt"},defaultClass:"ju367vbr"},selectedOptionBorder:{conditions:{base:"ju367vbu",hover:"ju367vbv",active:"ju367vbw"},defaultClass:"ju367vbu"},standby:{conditions:{base:"ju367vbx",hover:"ju367vby",active:"ju367vbz"},defaultClass:"ju367vbx"}}},borderColor:{values:{accentColor:{conditions:{base:"ju367vc0",hover:"ju367vc1",active:"ju367vc2"},defaultClass:"ju367vc0"},accentColorForeground:{conditions:{base:"ju367vc3",hover:"ju367vc4",active:"ju367vc5"},defaultClass:"ju367vc3"},actionButtonBorder:{conditions:{base:"ju367vc6",hover:"ju367vc7",active:"ju367vc8"},defaultClass:"ju367vc6"},actionButtonBorderMobile:{conditions:{base:"ju367vc9",hover:"ju367vca",active:"ju367vcb"},defaultClass:"ju367vc9"},actionButtonSecondaryBackground:{conditions:{base:"ju367vcc",hover:"ju367vcd",active:"ju367vce"},defaultClass:"ju367vcc"},closeButton:{conditions:{base:"ju367vcf",hover:"ju367vcg",active:"ju367vch"},defaultClass:"ju367vcf"},closeButtonBackground:{conditions:{base:"ju367vci",hover:"ju367vcj",active:"ju367vck"},defaultClass:"ju367vci"},connectButtonBackground:{conditions:{base:"ju367vcl",hover:"ju367vcm",active:"ju367vcn"},defaultClass:"ju367vcl"},connectButtonBackgroundError:{conditions:{base:"ju367vco",hover:"ju367vcp",active:"ju367vcq"},defaultClass:"ju367vco"},connectButtonInnerBackground:{conditions:{base:"ju367vcr",hover:"ju367vcs",active:"ju367vct"},defaultClass:"ju367vcr"},connectButtonText:{conditions:{base:"ju367vcu",hover:"ju367vcv",active:"ju367vcw"},defaultClass:"ju367vcu"},connectButtonTextError:{conditions:{base:"ju367vcx",hover:"ju367vcy",active:"ju367vcz"},defaultClass:"ju367vcx"},connectionIndicator:{conditions:{base:"ju367vd0",hover:"ju367vd1",active:"ju367vd2"},defaultClass:"ju367vd0"},downloadBottomCardBackground:{conditions:{base:"ju367vd3",hover:"ju367vd4",active:"ju367vd5"},defaultClass:"ju367vd3"},downloadTopCardBackground:{conditions:{base:"ju367vd6",hover:"ju367vd7",active:"ju367vd8"},defaultClass:"ju367vd6"},error:{conditions:{base:"ju367vd9",hover:"ju367vda",active:"ju367vdb"},defaultClass:"ju367vd9"},generalBorder:{conditions:{base:"ju367vdc",hover:"ju367vdd",active:"ju367vde"},defaultClass:"ju367vdc"},generalBorderDim:{conditions:{base:"ju367vdf",hover:"ju367vdg",active:"ju367vdh"},defaultClass:"ju367vdf"},menuItemBackground:{conditions:{base:"ju367vdi",hover:"ju367vdj",active:"ju367vdk"},defaultClass:"ju367vdi"},modalBackdrop:{conditions:{base:"ju367vdl",hover:"ju367vdm",active:"ju367vdn"},defaultClass:"ju367vdl"},modalBackground:{conditions:{base:"ju367vdo",hover:"ju367vdp",active:"ju367vdq"},defaultClass:"ju367vdo"},modalBorder:{conditions:{base:"ju367vdr",hover:"ju367vds",active:"ju367vdt"},defaultClass:"ju367vdr"},modalText:{conditions:{base:"ju367vdu",hover:"ju367vdv",active:"ju367vdw"},defaultClass:"ju367vdu"},modalTextDim:{conditions:{base:"ju367vdx",hover:"ju367vdy",active:"ju367vdz"},defaultClass:"ju367vdx"},modalTextSecondary:{conditions:{base:"ju367ve0",hover:"ju367ve1",active:"ju367ve2"},defaultClass:"ju367ve0"},profileAction:{conditions:{base:"ju367ve3",hover:"ju367ve4",active:"ju367ve5"},defaultClass:"ju367ve3"},profileActionHover:{conditions:{base:"ju367ve6",hover:"ju367ve7",active:"ju367ve8"},defaultClass:"ju367ve6"},profileForeground:{conditions:{base:"ju367ve9",hover:"ju367vea",active:"ju367veb"},defaultClass:"ju367ve9"},selectedOptionBorder:{conditions:{base:"ju367vec",hover:"ju367ved",active:"ju367vee"},defaultClass:"ju367vec"},standby:{conditions:{base:"ju367vef",hover:"ju367veg",active:"ju367veh"},defaultClass:"ju367vef"}}},boxShadow:{values:{connectButton:{conditions:{base:"ju367vei",hover:"ju367vej",active:"ju367vek"},defaultClass:"ju367vei"},dialog:{conditions:{base:"ju367vel",hover:"ju367vem",active:"ju367ven"},defaultClass:"ju367vel"},profileDetailsAction:{conditions:{base:"ju367veo",hover:"ju367vep",active:"ju367veq"},defaultClass:"ju367veo"},selectedOption:{conditions:{base:"ju367ver",hover:"ju367ves",active:"ju367vet"},defaultClass:"ju367ver"},selectedWallet:{conditions:{base:"ju367veu",hover:"ju367vev",active:"ju367vew"},defaultClass:"ju367veu"},walletLogo:{conditions:{base:"ju367vex",hover:"ju367vey",active:"ju367vez"},defaultClass:"ju367vex"}}},color:{values:{accentColor:{conditions:{base:"ju367vf0",hover:"ju367vf1",active:"ju367vf2"},defaultClass:"ju367vf0"},accentColorForeground:{conditions:{base:"ju367vf3",hover:"ju367vf4",active:"ju367vf5"},defaultClass:"ju367vf3"},actionButtonBorder:{conditions:{base:"ju367vf6",hover:"ju367vf7",active:"ju367vf8"},defaultClass:"ju367vf6"},actionButtonBorderMobile:{conditions:{base:"ju367vf9",hover:"ju367vfa",active:"ju367vfb"},defaultClass:"ju367vf9"},actionButtonSecondaryBackground:{conditions:{base:"ju367vfc",hover:"ju367vfd",active:"ju367vfe"},defaultClass:"ju367vfc"},closeButton:{conditions:{base:"ju367vff",hover:"ju367vfg",active:"ju367vfh"},defaultClass:"ju367vff"},closeButtonBackground:{conditions:{base:"ju367vfi",hover:"ju367vfj",active:"ju367vfk"},defaultClass:"ju367vfi"},connectButtonBackground:{conditions:{base:"ju367vfl",hover:"ju367vfm",active:"ju367vfn"},defaultClass:"ju367vfl"},connectButtonBackgroundError:{conditions:{base:"ju367vfo",hover:"ju367vfp",active:"ju367vfq"},defaultClass:"ju367vfo"},connectButtonInnerBackground:{conditions:{base:"ju367vfr",hover:"ju367vfs",active:"ju367vft"},defaultClass:"ju367vfr"},connectButtonText:{conditions:{base:"ju367vfu",hover:"ju367vfv",active:"ju367vfw"},defaultClass:"ju367vfu"},connectButtonTextError:{conditions:{base:"ju367vfx",hover:"ju367vfy",active:"ju367vfz"},defaultClass:"ju367vfx"},connectionIndicator:{conditions:{base:"ju367vg0",hover:"ju367vg1",active:"ju367vg2"},defaultClass:"ju367vg0"},downloadBottomCardBackground:{conditions:{base:"ju367vg3",hover:"ju367vg4",active:"ju367vg5"},defaultClass:"ju367vg3"},downloadTopCardBackground:{conditions:{base:"ju367vg6",hover:"ju367vg7",active:"ju367vg8"},defaultClass:"ju367vg6"},error:{conditions:{base:"ju367vg9",hover:"ju367vga",active:"ju367vgb"},defaultClass:"ju367vg9"},generalBorder:{conditions:{base:"ju367vgc",hover:"ju367vgd",active:"ju367vge"},defaultClass:"ju367vgc"},generalBorderDim:{conditions:{base:"ju367vgf",hover:"ju367vgg",active:"ju367vgh"},defaultClass:"ju367vgf"},menuItemBackground:{conditions:{base:"ju367vgi",hover:"ju367vgj",active:"ju367vgk"},defaultClass:"ju367vgi"},modalBackdrop:{conditions:{base:"ju367vgl",hover:"ju367vgm",active:"ju367vgn"},defaultClass:"ju367vgl"},modalBackground:{conditions:{base:"ju367vgo",hover:"ju367vgp",active:"ju367vgq"},defaultClass:"ju367vgo"},modalBorder:{conditions:{base:"ju367vgr",hover:"ju367vgs",active:"ju367vgt"},defaultClass:"ju367vgr"},modalText:{conditions:{base:"ju367vgu",hover:"ju367vgv",active:"ju367vgw"},defaultClass:"ju367vgu"},modalTextDim:{conditions:{base:"ju367vgx",hover:"ju367vgy",active:"ju367vgz"},defaultClass:"ju367vgx"},modalTextSecondary:{conditions:{base:"ju367vh0",hover:"ju367vh1",active:"ju367vh2"},defaultClass:"ju367vh0"},profileAction:{conditions:{base:"ju367vh3",hover:"ju367vh4",active:"ju367vh5"},defaultClass:"ju367vh3"},profileActionHover:{conditions:{base:"ju367vh6",hover:"ju367vh7",active:"ju367vh8"},defaultClass:"ju367vh6"},profileForeground:{conditions:{base:"ju367vh9",hover:"ju367vha",active:"ju367vhb"},defaultClass:"ju367vh9"},selectedOptionBorder:{conditions:{base:"ju367vhc",hover:"ju367vhd",active:"ju367vhe"},defaultClass:"ju367vhc"},standby:{conditions:{base:"ju367vhf",hover:"ju367vhg",active:"ju367vhh"},defaultClass:"ju367vhf"}}}}},{conditions:{defaultCondition:"smallScreen",conditionNames:["smallScreen","largeScreen"],responsiveArray:void 0},styles:{alignItems:{values:{"flex-start":{conditions:{smallScreen:"ju367v0",largeScreen:"ju367v1"},defaultClass:"ju367v0"},"flex-end":{conditions:{smallScreen:"ju367v2",largeScreen:"ju367v3"},defaultClass:"ju367v2"},center:{conditions:{smallScreen:"ju367v4",largeScreen:"ju367v5"},defaultClass:"ju367v4"}}},display:{values:{none:{conditions:{smallScreen:"ju367v6",largeScreen:"ju367v7"},defaultClass:"ju367v6"},block:{conditions:{smallScreen:"ju367v8",largeScreen:"ju367v9"},defaultClass:"ju367v8"},flex:{conditions:{smallScreen:"ju367va",largeScreen:"ju367vb"},defaultClass:"ju367va"},inline:{conditions:{smallScreen:"ju367vc",largeScreen:"ju367vd"},defaultClass:"ju367vc"}}}}},{conditions:void 0,styles:{margin:{mappings:["marginTop","marginBottom","marginLeft","marginRight"]},marginX:{mappings:["marginLeft","marginRight"]},marginY:{mappings:["marginTop","marginBottom"]},padding:{mappings:["paddingTop","paddingBottom","paddingLeft","paddingRight"]},paddingX:{mappings:["paddingLeft","paddingRight"]},paddingY:{mappings:["paddingTop","paddingBottom"]},alignSelf:{values:{"flex-start":{defaultClass:"ju367ve"},"flex-end":{defaultClass:"ju367vf"},center:{defaultClass:"ju367vg"}}},backgroundSize:{values:{cover:{defaultClass:"ju367vh"}}},borderRadius:{values:{1:{defaultClass:"ju367vi"},6:{defaultClass:"ju367vj"},10:{defaultClass:"ju367vk"},13:{defaultClass:"ju367vl"},actionButton:{defaultClass:"ju367vm"},connectButton:{defaultClass:"ju367vn"},menuButton:{defaultClass:"ju367vo"},modal:{defaultClass:"ju367vp"},modalMobile:{defaultClass:"ju367vq"},"25%":{defaultClass:"ju367vr"},full:{defaultClass:"ju367vs"}}},borderStyle:{values:{solid:{defaultClass:"ju367vt"}}},borderWidth:{values:{0:{defaultClass:"ju367vu"},1:{defaultClass:"ju367vv"},2:{defaultClass:"ju367vw"},4:{defaultClass:"ju367vx"}}},cursor:{values:{pointer:{defaultClass:"ju367vy"},none:{defaultClass:"ju367vz"}}},pointerEvents:{values:{none:{defaultClass:"ju367v10"},all:{defaultClass:"ju367v11"}}},minHeight:{values:{8:{defaultClass:"ju367v12"},44:{defaultClass:"ju367v13"}}},flexDirection:{values:{row:{defaultClass:"ju367v14"},column:{defaultClass:"ju367v15"}}},fontFamily:{values:{body:{defaultClass:"ju367v16"}}},fontSize:{values:{12:{defaultClass:"ju367v17"},13:{defaultClass:"ju367v18"},14:{defaultClass:"ju367v19"},16:{defaultClass:"ju367v1a"},18:{defaultClass:"ju367v1b"},20:{defaultClass:"ju367v1c"},23:{defaultClass:"ju367v1d"}}},fontWeight:{values:{regular:{defaultClass:"ju367v1e"},medium:{defaultClass:"ju367v1f"},semibold:{defaultClass:"ju367v1g"},bold:{defaultClass:"ju367v1h"},heavy:{defaultClass:"ju367v1i"}}},gap:{values:{0:{defaultClass:"ju367v1j"},1:{defaultClass:"ju367v1k"},2:{defaultClass:"ju367v1l"},3:{defaultClass:"ju367v1m"},4:{defaultClass:"ju367v1n"},5:{defaultClass:"ju367v1o"},6:{defaultClass:"ju367v1p"},8:{defaultClass:"ju367v1q"},10:{defaultClass:"ju367v1r"},12:{defaultClass:"ju367v1s"},14:{defaultClass:"ju367v1t"},16:{defaultClass:"ju367v1u"},18:{defaultClass:"ju367v1v"},20:{defaultClass:"ju367v1w"},24:{defaultClass:"ju367v1x"},28:{defaultClass:"ju367v1y"},32:{defaultClass:"ju367v1z"},36:{defaultClass:"ju367v20"},44:{defaultClass:"ju367v21"},64:{defaultClass:"ju367v22"},"-1":{defaultClass:"ju367v23"}}},height:{values:{1:{defaultClass:"ju367v24"},2:{defaultClass:"ju367v25"},4:{defaultClass:"ju367v26"},8:{defaultClass:"ju367v27"},12:{defaultClass:"ju367v28"},20:{defaultClass:"ju367v29"},24:{defaultClass:"ju367v2a"},28:{defaultClass:"ju367v2b"},30:{defaultClass:"ju367v2c"},32:{defaultClass:"ju367v2d"},34:{defaultClass:"ju367v2e"},36:{defaultClass:"ju367v2f"},40:{defaultClass:"ju367v2g"},44:{defaultClass:"ju367v2h"},48:{defaultClass:"ju367v2i"},54:{defaultClass:"ju367v2j"},60:{defaultClass:"ju367v2k"},200:{defaultClass:"ju367v2l"},full:{defaultClass:"ju367v2m"},max:{defaultClass:"ju367v2n"}}},justifyContent:{values:{"flex-start":{defaultClass:"ju367v2o"},"flex-end":{defaultClass:"ju367v2p"},center:{defaultClass:"ju367v2q"},"space-between":{defaultClass:"ju367v2r"},"space-around":{defaultClass:"ju367v2s"}}},textAlign:{values:{left:{defaultClass:"ju367v2t"},center:{defaultClass:"ju367v2u"},inherit:{defaultClass:"ju367v2v"}}},marginBottom:{values:{0:{defaultClass:"ju367v2w"},1:{defaultClass:"ju367v2x"},2:{defaultClass:"ju367v2y"},3:{defaultClass:"ju367v2z"},4:{defaultClass:"ju367v30"},5:{defaultClass:"ju367v31"},6:{defaultClass:"ju367v32"},8:{defaultClass:"ju367v33"},10:{defaultClass:"ju367v34"},12:{defaultClass:"ju367v35"},14:{defaultClass:"ju367v36"},16:{defaultClass:"ju367v37"},18:{defaultClass:"ju367v38"},20:{defaultClass:"ju367v39"},24:{defaultClass:"ju367v3a"},28:{defaultClass:"ju367v3b"},32:{defaultClass:"ju367v3c"},36:{defaultClass:"ju367v3d"},44:{defaultClass:"ju367v3e"},64:{defaultClass:"ju367v3f"},"-1":{defaultClass:"ju367v3g"}}},marginLeft:{values:{0:{defaultClass:"ju367v3h"},1:{defaultClass:"ju367v3i"},2:{defaultClass:"ju367v3j"},3:{defaultClass:"ju367v3k"},4:{defaultClass:"ju367v3l"},5:{defaultClass:"ju367v3m"},6:{defaultClass:"ju367v3n"},8:{defaultClass:"ju367v3o"},10:{defaultClass:"ju367v3p"},12:{defaultClass:"ju367v3q"},14:{defaultClass:"ju367v3r"},16:{defaultClass:"ju367v3s"},18:{defaultClass:"ju367v3t"},20:{defaultClass:"ju367v3u"},24:{defaultClass:"ju367v3v"},28:{defaultClass:"ju367v3w"},32:{defaultClass:"ju367v3x"},36:{defaultClass:"ju367v3y"},44:{defaultClass:"ju367v3z"},64:{defaultClass:"ju367v40"},"-1":{defaultClass:"ju367v41"}}},marginRight:{values:{0:{defaultClass:"ju367v42"},1:{defaultClass:"ju367v43"},2:{defaultClass:"ju367v44"},3:{defaultClass:"ju367v45"},4:{defaultClass:"ju367v46"},5:{defaultClass:"ju367v47"},6:{defaultClass:"ju367v48"},8:{defaultClass:"ju367v49"},10:{defaultClass:"ju367v4a"},12:{defaultClass:"ju367v4b"},14:{defaultClass:"ju367v4c"},16:{defaultClass:"ju367v4d"},18:{defaultClass:"ju367v4e"},20:{defaultClass:"ju367v4f"},24:{defaultClass:"ju367v4g"},28:{defaultClass:"ju367v4h"},32:{defaultClass:"ju367v4i"},36:{defaultClass:"ju367v4j"},44:{defaultClass:"ju367v4k"},64:{defaultClass:"ju367v4l"},"-1":{defaultClass:"ju367v4m"}}},marginTop:{values:{0:{defaultClass:"ju367v4n"},1:{defaultClass:"ju367v4o"},2:{defaultClass:"ju367v4p"},3:{defaultClass:"ju367v4q"},4:{defaultClass:"ju367v4r"},5:{defaultClass:"ju367v4s"},6:{defaultClass:"ju367v4t"},8:{defaultClass:"ju367v4u"},10:{defaultClass:"ju367v4v"},12:{defaultClass:"ju367v4w"},14:{defaultClass:"ju367v4x"},16:{defaultClass:"ju367v4y"},18:{defaultClass:"ju367v4z"},20:{defaultClass:"ju367v50"},24:{defaultClass:"ju367v51"},28:{defaultClass:"ju367v52"},32:{defaultClass:"ju367v53"},36:{defaultClass:"ju367v54"},44:{defaultClass:"ju367v55"},64:{defaultClass:"ju367v56"},"-1":{defaultClass:"ju367v57"}}},maxWidth:{values:{1:{defaultClass:"ju367v58"},2:{defaultClass:"ju367v59"},4:{defaultClass:"ju367v5a"},8:{defaultClass:"ju367v5b"},12:{defaultClass:"ju367v5c"},20:{defaultClass:"ju367v5d"},24:{defaultClass:"ju367v5e"},28:{defaultClass:"ju367v5f"},30:{defaultClass:"ju367v5g"},32:{defaultClass:"ju367v5h"},34:{defaultClass:"ju367v5i"},36:{defaultClass:"ju367v5j"},40:{defaultClass:"ju367v5k"},44:{defaultClass:"ju367v5l"},48:{defaultClass:"ju367v5m"},54:{defaultClass:"ju367v5n"},60:{defaultClass:"ju367v5o"},200:{defaultClass:"ju367v5p"},full:{defaultClass:"ju367v5q"},max:{defaultClass:"ju367v5r"}}},minWidth:{values:{1:{defaultClass:"ju367v5s"},2:{defaultClass:"ju367v5t"},4:{defaultClass:"ju367v5u"},8:{defaultClass:"ju367v5v"},12:{defaultClass:"ju367v5w"},20:{defaultClass:"ju367v5x"},24:{defaultClass:"ju367v5y"},28:{defaultClass:"ju367v5z"},30:{defaultClass:"ju367v60"},32:{defaultClass:"ju367v61"},34:{defaultClass:"ju367v62"},36:{defaultClass:"ju367v63"},40:{defaultClass:"ju367v64"},44:{defaultClass:"ju367v65"},48:{defaultClass:"ju367v66"},54:{defaultClass:"ju367v67"},60:{defaultClass:"ju367v68"},200:{defaultClass:"ju367v69"},full:{defaultClass:"ju367v6a"},max:{defaultClass:"ju367v6b"}}},overflow:{values:{hidden:{defaultClass:"ju367v6c"}}},paddingBottom:{values:{0:{defaultClass:"ju367v6d"},1:{defaultClass:"ju367v6e"},2:{defaultClass:"ju367v6f"},3:{defaultClass:"ju367v6g"},4:{defaultClass:"ju367v6h"},5:{defaultClass:"ju367v6i"},6:{defaultClass:"ju367v6j"},8:{defaultClass:"ju367v6k"},10:{defaultClass:"ju367v6l"},12:{defaultClass:"ju367v6m"},14:{defaultClass:"ju367v6n"},16:{defaultClass:"ju367v6o"},18:{defaultClass:"ju367v6p"},20:{defaultClass:"ju367v6q"},24:{defaultClass:"ju367v6r"},28:{defaultClass:"ju367v6s"},32:{defaultClass:"ju367v6t"},36:{defaultClass:"ju367v6u"},44:{defaultClass:"ju367v6v"},64:{defaultClass:"ju367v6w"},"-1":{defaultClass:"ju367v6x"}}},paddingLeft:{values:{0:{defaultClass:"ju367v6y"},1:{defaultClass:"ju367v6z"},2:{defaultClass:"ju367v70"},3:{defaultClass:"ju367v71"},4:{defaultClass:"ju367v72"},5:{defaultClass:"ju367v73"},6:{defaultClass:"ju367v74"},8:{defaultClass:"ju367v75"},10:{defaultClass:"ju367v76"},12:{defaultClass:"ju367v77"},14:{defaultClass:"ju367v78"},16:{defaultClass:"ju367v79"},18:{defaultClass:"ju367v7a"},20:{defaultClass:"ju367v7b"},24:{defaultClass:"ju367v7c"},28:{defaultClass:"ju367v7d"},32:{defaultClass:"ju367v7e"},36:{defaultClass:"ju367v7f"},44:{defaultClass:"ju367v7g"},64:{defaultClass:"ju367v7h"},"-1":{defaultClass:"ju367v7i"}}},paddingRight:{values:{0:{defaultClass:"ju367v7j"},1:{defaultClass:"ju367v7k"},2:{defaultClass:"ju367v7l"},3:{defaultClass:"ju367v7m"},4:{defaultClass:"ju367v7n"},5:{defaultClass:"ju367v7o"},6:{defaultClass:"ju367v7p"},8:{defaultClass:"ju367v7q"},10:{defaultClass:"ju367v7r"},12:{defaultClass:"ju367v7s"},14:{defaultClass:"ju367v7t"},16:{defaultClass:"ju367v7u"},18:{defaultClass:"ju367v7v"},20:{defaultClass:"ju367v7w"},24:{defaultClass:"ju367v7x"},28:{defaultClass:"ju367v7y"},32:{defaultClass:"ju367v7z"},36:{defaultClass:"ju367v80"},44:{defaultClass:"ju367v81"},64:{defaultClass:"ju367v82"},"-1":{defaultClass:"ju367v83"}}},paddingTop:{values:{0:{defaultClass:"ju367v84"},1:{defaultClass:"ju367v85"},2:{defaultClass:"ju367v86"},3:{defaultClass:"ju367v87"},4:{defaultClass:"ju367v88"},5:{defaultClass:"ju367v89"},6:{defaultClass:"ju367v8a"},8:{defaultClass:"ju367v8b"},10:{defaultClass:"ju367v8c"},12:{defaultClass:"ju367v8d"},14:{defaultClass:"ju367v8e"},16:{defaultClass:"ju367v8f"},18:{defaultClass:"ju367v8g"},20:{defaultClass:"ju367v8h"},24:{defaultClass:"ju367v8i"},28:{defaultClass:"ju367v8j"},32:{defaultClass:"ju367v8k"},36:{defaultClass:"ju367v8l"},44:{defaultClass:"ju367v8m"},64:{defaultClass:"ju367v8n"},"-1":{defaultClass:"ju367v8o"}}},position:{values:{absolute:{defaultClass:"ju367v8p"},fixed:{defaultClass:"ju367v8q"},relative:{defaultClass:"ju367v8r"}}},WebkitUserSelect:{values:{none:{defaultClass:"ju367v8s"}}},right:{values:{0:{defaultClass:"ju367v8t"}}},transition:{values:{default:{defaultClass:"ju367v8u"},transform:{defaultClass:"ju367v8v"}}},userSelect:{values:{none:{defaultClass:"ju367v8w"}}},width:{values:{1:{defaultClass:"ju367v8x"},2:{defaultClass:"ju367v8y"},4:{defaultClass:"ju367v8z"},8:{defaultClass:"ju367v90"},12:{defaultClass:"ju367v91"},20:{defaultClass:"ju367v92"},24:{defaultClass:"ju367v93"},28:{defaultClass:"ju367v94"},30:{defaultClass:"ju367v95"},32:{defaultClass:"ju367v96"},34:{defaultClass:"ju367v97"},36:{defaultClass:"ju367v98"},40:{defaultClass:"ju367v99"},44:{defaultClass:"ju367v9a"},48:{defaultClass:"ju367v9b"},54:{defaultClass:"ju367v9c"},60:{defaultClass:"ju367v9d"},200:{defaultClass:"ju367v9e"},full:{defaultClass:"ju367v9f"},max:{defaultClass:"ju367v9g"}}},backdropFilter:{values:{modalOverlay:{defaultClass:"ju367v9h"}}}}}),a1={colors:{accentColor:"var(--rk-colors-accentColor)",accentColorForeground:"var(--rk-colors-accentColorForeground)",actionButtonBorder:"var(--rk-colors-actionButtonBorder)",actionButtonBorderMobile:"var(--rk-colors-actionButtonBorderMobile)",actionButtonSecondaryBackground:"var(--rk-colors-actionButtonSecondaryBackground)",closeButton:"var(--rk-colors-closeButton)",closeButtonBackground:"var(--rk-colors-closeButtonBackground)",connectButtonBackground:"var(--rk-colors-connectButtonBackground)",connectButtonBackgroundError:"var(--rk-colors-connectButtonBackgroundError)",connectButtonInnerBackground:"var(--rk-colors-connectButtonInnerBackground)",connectButtonText:"var(--rk-colors-connectButtonText)",connectButtonTextError:"var(--rk-colors-connectButtonTextError)",connectionIndicator:"var(--rk-colors-connectionIndicator)",downloadBottomCardBackground:"var(--rk-colors-downloadBottomCardBackground)",downloadTopCardBackground:"var(--rk-colors-downloadTopCardBackground)",error:"var(--rk-colors-error)",generalBorder:"var(--rk-colors-generalBorder)",generalBorderDim:"var(--rk-colors-generalBorderDim)",menuItemBackground:"var(--rk-colors-menuItemBackground)",modalBackdrop:"var(--rk-colors-modalBackdrop)",modalBackground:"var(--rk-colors-modalBackground)",modalBorder:"var(--rk-colors-modalBorder)",modalText:"var(--rk-colors-modalText)",modalTextDim:"var(--rk-colors-modalTextDim)",modalTextSecondary:"var(--rk-colors-modalTextSecondary)",profileAction:"var(--rk-colors-profileAction)",profileActionHover:"var(--rk-colors-profileActionHover)",profileForeground:"var(--rk-colors-profileForeground)",selectedOptionBorder:"var(--rk-colors-selectedOptionBorder)",standby:"var(--rk-colors-standby)"},fonts:{body:"var(--rk-fonts-body)"},radii:{actionButton:"var(--rk-radii-actionButton)",connectButton:"var(--rk-radii-connectButton)",menuButton:"var(--rk-radii-menuButton)",modal:"var(--rk-radii-modal)",modalMobile:"var(--rk-radii-modalMobile)"},shadows:{connectButton:"var(--rk-shadows-connectButton)",dialog:"var(--rk-shadows-dialog)",profileDetailsAction:"var(--rk-shadows-profileDetailsAction)",selectedOption:"var(--rk-shadows-selectedOption)",selectedWallet:"var(--rk-shadows-selectedWallet)",walletLogo:"var(--rk-shadows-walletLogo)"},blurs:{modalOverlay:"var(--rk-blurs-modalOverlay)"}},a2={shrink:"_12cbo8i6",shrinkSm:"_12cbo8i7"},a3={grow:"_12cbo8i4",growLg:"_12cbo8i5"};function a4({active:a,hover:b}){return["_12cbo8i3 ju367v8r",b&&a3[b],a2[a]]}function a5(a){return a}var a6=(0,u.createContext)(null);function a7({adapter:a,children:b,enabled:c=!0,status:d}){let{connector:e}=(0,A.F)(),[f,g]=(0,u.useState)();return(0,B.U)({onDisconnect:()=>{a.signOut(),g(void 0)}}),u.createElement(a6.Provider,{value:(0,u.useMemo)(()=>c?{adapter:a,status:d}:null,[c,a,d])},b)}function a8(){let a=(0,u.useContext)(a6);return a?.status??null}function a9(){let a=a8(),{isConnected:b}=(0,A.F)();return b?a&&("loading"===a||"unauthenticated"===a)?a:"connected":"disconnected"}function ba(){return"undefined"!=typeof navigator&&/android/i.test(navigator.userAgent)}function bb(){return"undefined"!=typeof navigator&&/iPhone|iPod/.test(navigator.userAgent)||"undefined"!=typeof navigator&&(/iPad/.test(navigator.userAgent)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1)}function bc(){return ba()||bb()}var bd={a:"iekbcca",blockquote:"iekbcc2",button:"iekbcc9",input:"iekbcc8 iekbcc5 iekbcc4",mark:"iekbcc6",ol:"iekbcc1",q:"iekbcc2",select:"iekbcc7 iekbcc5 iekbcc4",table:"iekbcc3",textarea:"iekbcc5 iekbcc4",ul:"iekbcc1"},be=u.forwardRef(({as:a="div",className:b,testId:c,...d},e)=>{let f={},g={};for(let a in d)a0.properties.has(a)?f[a]=d[a]:g[a]=d[a];let h=(({reset:a,...b})=>{if(!a)return a0(b);let c=bd[a],d=a0(b);return(0,C.A)("iekbcc0",c,d)})({reset:"string"==typeof a?a:"div",...f});return u.createElement(a,{className:(0,C.A)(h,b),...g,"data-testid":c?`rk-${c.replace(/^rk-/,"")}`:void 0,ref:e})});be.displayName="Box";var bf=new Map,bg=new Map;async function bh(a){let b=bg.get(a);if(b)return b;let c=async()=>a().then(async b=>(bf.set(a,b),b)),d=c().catch(b=>c().catch(b=>{bg.delete(a)}));return bg.set(a,d),d}async function bi(...a){return await Promise.all(a.map(a=>"function"==typeof a?bh(a):a))}function bj(a){let b="function"==typeof a?bf.get(a):void 0;return!function(){let[,a]=(0,u.useReducer)(a=>a+1,0)}(),"function"==typeof a?b:a}function bk({alt:a,background:b,borderColor:c,borderRadius:d,useAsImage:e,boxShadow:f,height:g,src:h,width:i,testId:j}){let k=bb(),l=bj(h),m=l&&/^http/.test(l),[n,o]=(0,u.useReducer)(()=>!0,!1);return u.createElement(be,{"aria-label":a,borderRadius:d,boxShadow:f,height:"string"==typeof g?g:void 0,overflow:"hidden",position:"relative",role:"img",style:{background:b,height:"number"==typeof g?g:void 0,width:"number"==typeof i?i:void 0},width:"string"==typeof i?i:void 0,testId:j},u.createElement(be,{...m?{"aria-hidden":!0,as:"img",onLoad:o,src:l}:{"aria-hidden":!0,as:"img",src:l},height:"full",position:"absolute",...k?{WebkitUserSelect:"none"}:{},style:{WebkitTouchCallout:"none",transition:"opacity .15s linear",userSelect:"none",...!e&&m?{opacity:+!!n}:{}},width:"full"}),c?u.createElement(be,{..."object"==typeof c&&"custom"in c?{style:{borderColor:c.custom}}:{borderColor:c},borderRadius:d,borderStyle:"solid",borderWidth:"1",height:"full",position:"relative",width:"full"}):null)}var bl=({height:a=21,width:b=21})=>{let c=(a=>(0,u.useMemo)(()=>`${a}_${Math.round(1e9*Math.random())}`,[a]))("spinner");return u.createElement("svg",{className:"_1luule42",fill:"none",height:a,viewBox:"0 0 21 21",width:b,xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Loading"),u.createElement("clipPath",{id:c},u.createElement("path",{d:"M10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C11.3284 18 12 18.6716 12 19.5C12 20.3284 11.3284 21 10.5 21C4.70101 21 0 16.299 0 10.5C0 4.70101 4.70101 0 10.5 0C16.299 0 21 4.70101 21 10.5C21 11.3284 20.3284 12 19.5 12C18.6716 12 18 11.3284 18 10.5C18 6.35786 14.6421 3 10.5 3Z"})),u.createElement("foreignObject",{clipPath:`url(#${c})`,height:"21",width:"21",x:"0",y:"0"},u.createElement("div",{className:"_1luule43"})))},bm=[{color:"#FC5C54",emoji:"\uD83C\uDF36"},{color:"#FFD95A",emoji:"\uD83E\uDD11"},{color:"#E95D72",emoji:"\uD83D\uDC19"},{color:"#6A87C8",emoji:"\uD83E\uDED0"},{color:"#5FD0F3",emoji:"\uD83D\uDC33"},{color:"#FC5C54",emoji:"\uD83E\uDD36"},{color:"#75C06B",emoji:"\uD83C\uDF32"},{color:"#FFDD86",emoji:"\uD83C\uDF1E"},{color:"#5FC6D4",emoji:"\uD83D\uDC12"},{color:"#FF949A",emoji:"\uD83D\uDC35"},{color:"#FF8024",emoji:"\uD83E\uDD8A"},{color:"#9BA1A4",emoji:"\uD83D\uDC3C"},{color:"#EC66FF",emoji:"\uD83E\uDD84"},{color:"#FF8CBC",emoji:"\uD83D\uDC37"},{color:"#FF9A23",emoji:"\uD83D\uDC27"},{color:"#FF949A",emoji:"\uD83E\uDDA9"},{color:"#C5DADB",emoji:"\uD83D\uDC7D"},{color:"#FC5C54",emoji:"\uD83C\uDF88"},{color:"#FF949A",emoji:"\uD83C\uDF49"},{color:"#FFD95A",emoji:"\uD83C\uDF89"},{color:"#A8CE63",emoji:"\uD83D\uDC32"},{color:"#71ABFF",emoji:"\uD83C\uDF0E"},{color:"#FFE279",emoji:"\uD83C\uDF4A"},{color:"#B6B1B6",emoji:"\uD83D\uDC2D"},{color:"#FF6780",emoji:"\uD83C\uDF63"},{color:"#FFD95A",emoji:"\uD83D\uDC25"},{color:"#A575FF",emoji:"\uD83D\uDC7E"},{color:"#A8CE63",emoji:"\uD83E\uDD66"},{color:"#FC5C54",emoji:"\uD83D\uDC79"},{color:"#FFE279",emoji:"\uD83D\uDE40"},{color:"#5FD0F3",emoji:"⛱"},{color:"#4D82FF",emoji:"⛵️"},{color:"#FFE279",emoji:"\uD83E\uDD73"},{color:"#FF949A",emoji:"\uD83E\uDD2F"},{color:"#FFB35A",emoji:"\uD83E\uDD20"}],bn=({address:a,ensImage:b,size:c})=>{let[d,e]=(0,u.useState)(!1);(0,u.useEffect)(()=>{if(b){let a=new Image;a.src=b,a.onload=()=>e(!0)}},[b]);let{color:f,emoji:g}=(0,u.useMemo)(()=>(function(a){let b=Math.abs(function(a){let b=0;if(0===a.length)return b;for(let c=0;c<a.length;c++)b=(b<<5)-b+a.charCodeAt(c)|0;return b}(("string"==typeof a?a:"").toLowerCase())%bm.length);return bm[b??0]})(a),[a]);return b?d?u.createElement(be,{backgroundSize:"cover",borderRadius:"full",position:"absolute",style:{backgroundImage:`url(${b})`,backgroundPosition:"center",height:c,width:c}}):u.createElement(be,{alignItems:"center",backgroundSize:"cover",borderRadius:"full",color:"modalText",display:"flex",justifyContent:"center",position:"absolute",style:{height:c,width:c}},u.createElement(bl,null)):u.createElement(be,{alignItems:"center",display:"flex",justifyContent:"center",overflow:"hidden",style:{...!b&&{backgroundColor:f},height:c,width:c}},g)},bo=(0,u.createContext)(bn);function bp({address:a,imageUrl:b,loading:c,size:d}){let e=(0,u.useContext)(bo);return u.createElement(be,{"aria-hidden":!0,borderRadius:"full",overflow:"hidden",position:"relative",style:{height:`${d}px`,width:`${d}px`},userSelect:"none"},u.createElement(be,{alignItems:"center",borderRadius:"full",display:"flex",justifyContent:"center",overflow:"hidden",position:"absolute",style:{fontSize:`${Math.round(.55*d)}px`,height:`${d}px`,transform:c?"scale(0.72)":void 0,transition:".25s ease",transitionDelay:c?void 0:".1s",width:`${d}px`,willChange:"transform"},userSelect:"none"},u.createElement(e,{address:a,ensImage:b,size:d})),c&&u.createElement(be,{color:"accentColor",display:"flex",height:"full",position:"absolute",width:"full"},u.createElement(bl,{height:"100%",width:"100%"})))}var bq=()=>u.createElement("svg",{fill:"none",height:"7",width:"14",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Dropdown"),u.createElement("path",{d:"M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2.5",xmlns:"http://www.w3.org/2000/svg"})),br={defaultLocale:"en",locale:"en"},bs=new class{constructor(a){for(let[b,c]of(this.listeners=new Set,this.defaultLocale=br.defaultLocale,this.enableFallback=!1,this.locale=br.locale,this.cachedLocales=[],this.translations={},Object.entries(a)))this.cachedLocales=[...this.cachedLocales,b],this.translations={...this.translations,...this.flattenTranslation(c,b)}}missingMessage(a){return`[missing: "${this.locale}.${a}" translation]`}flattenTranslation(a,b){let c={},d=(a,b)=>{for(let e of Object.keys(a)){let f=`${b}.${e}`,g=a[e];"object"==typeof g&&null!==g?d(g,f):c[f]=g}};return d(a,b),c}translateWithReplacements(a,b={}){let c=a;for(let a in b){let d=b[a];c=c.replace(`%{${a}}`,d)}return c}t(a,b,c){let d=`${this.locale}.${a}`,e=this.translations[d];if(!e){if(this.enableFallback){let c=`${this.defaultLocale}.${a}`,d=this.translations[c];if(d)return this.translateWithReplacements(d,b)}return c?.rawKeyIfTranslationMissing?a:this.missingMessage(a)}return this.translateWithReplacements(e,b)}isLocaleCached(a){return this.cachedLocales.includes(a)}updateLocale(a){this.locale=a,this.notifyListeners()}setTranslations(a,b){this.isLocaleCached(a)||(this.cachedLocales=[...this.cachedLocales,a],this.translations={...this.translations,...this.flattenTranslation(b,a)}),this.locale=a,this.notifyListeners()}notifyListeners(){for(let a of this.listeners)a()}onChange(a){return this.listeners.add(a),()=>{this.listeners.delete(a)}}}({en:JSON.parse(t.n),"en-US":JSON.parse(t.n)});bs.defaultLocale="en-US",bs.locale="en-US",bs.enableFallback=!0;var bt=async a=>{switch(a){case"ar":case"ar-AR":return(await c.e(1635).then(c.bind(c,11635))).default;case"de":case"de-DE":return(await c.e(5824).then(c.bind(c,85824))).default;case"en":case"en-US":default:return(await c.e(8832).then(c.bind(c,28832))).default;case"es":case"es-419":return(await c.e(1097).then(c.bind(c,1097))).default;case"fr":case"fr-FR":return(await c.e(8511).then(c.bind(c,68511))).default;case"hi":case"hi-IN":return(await c.e(4744).then(c.bind(c,24744))).default;case"id":case"id-ID":return(await c.e(6100).then(c.bind(c,86100))).default;case"ja":case"ja-JP":return(await c.e(8991).then(c.bind(c,98991))).default;case"ko":case"ko-KR":return(await c.e(2419).then(c.bind(c,62419))).default;case"ms":case"ms-MY":return(await c.e(4521).then(c.bind(c,4521))).default;case"pt":case"pt-BR":return(await c.e(2267).then(c.bind(c,22267))).default;case"ru":case"ru-RU":return(await c.e(1225).then(c.bind(c,11225))).default;case"th":case"th-TH":return(await c.e(7326).then(c.bind(c,47326))).default;case"tr":case"tr-TR":return(await c.e(3181).then(c.bind(c,53181))).default;case"ua":case"uk-UA":return(await c.e(4530).then(c.bind(c,84530))).default;case"vi":case"vi-VN":return(await c.e(7290).then(c.bind(c,97290))).default;case"zh":case"zh-CN":case"zh-Hans":return(await c.e(1813).then(c.bind(c,1813))).default;case"zh-HK":return(await c.e(8878).then(c.bind(c,68878))).default;case"zh-Hant":case"zh-TW":return(await c.e(5632).then(c.bind(c,15632))).default}};async function bu(a){if(bs.isLocaleCached(a))return void bs.updateLocale(a);let b=await bt(a);bs.setTranslations(a,JSON.parse(b))}var bv=(0,u.createContext)({i18n:bs}),bw=({children:a,locale:b})=>{let[c,d]=(0,u.useState)(0),e=(0,u.useMemo)(()=>void 0,[]);(0,u.useEffect)(()=>bs.onChange(()=>{d(a=>a+1)}),[]),(0,u.useEffect)(()=>{b&&b!==bs.locale?bu(b):!b&&e&&e!==bs.locale&&bu(e)},[b,e]);let f=(0,u.useMemo)(()=>({t:(a,b)=>bs.t(a,b),i18n:bs}),[c]);return u.createElement(bv.Provider,{value:f},a)};function bx(a){return null!=a}var by={iconBackground:"#7290CC",iconUrl:async()=>(await c.e(3889).then(c.bind(c,13889))).default},bz={iconBackground:"#96bedc",iconUrl:async()=>(await c.e(4047).then(c.bind(c,44047))).default},bA={iconBackground:"#e84141",iconUrl:async()=>(await c.e(8150).then(c.bind(c,68150))).default},bB={iconBackground:"#0052ff",iconUrl:async()=>(await c.e(2610).then(c.bind(c,62610))).default},bC={iconBackground:"#814625",iconUrl:async()=>(await c.e(3994).then(c.bind(c,13994))).default},bD={iconBackground:"#000000",iconUrl:async()=>(await c.e(8212).then(c.bind(c,18212))).default},bE={iconBackground:"#ebac0e",iconUrl:async()=>(await c.e(5669).then(c.bind(c,15669))).default},bF={iconBackground:"#FCFF52",iconUrl:async()=>(await c.e(5811).then(c.bind(c,35811))).default},bG={iconBackground:"#002D74",iconUrl:async()=>(await c.e(5358).then(c.bind(c,75358))).default},bH={iconBackground:"#484c50",iconUrl:async()=>(await c.e(1461).then(c.bind(c,11461))).default},bI={iconBackground:"transparent",iconUrl:async()=>(await c.e(4008).then(c.bind(c,24008))).default},bJ={iconBackground:"#000000",iconUrl:async()=>(await c.e(4914).then(c.bind(c,14914))).default},bK={iconBackground:"#7132F5",iconUrl:async()=>(await c.e(5118).then(c.bind(c,15118))).default},bL={iconBackground:"transparent",iconUrl:async()=>(await c.e(5216).then(c.bind(c,25216))).default},bM={iconBackground:"#ffffff",iconUrl:async()=>(await c.e(7288).then(c.bind(c,37288))).default},bN={iconBackground:"#ffffff",iconUrl:async()=>(await c.e(3512).then(c.bind(c,3512))).default},bO={iconBackground:"#000000",iconUrl:async()=>(await c.e(3541).then(c.bind(c,33541))).default},bP={iconBackground:"#ff5a57",iconUrl:async()=>(await c.e(338).then(c.bind(c,80338))).default},bQ={iconBackground:"#9f71ec",iconUrl:async()=>(await c.e(4961).then(c.bind(c,24961))).default},bR={iconBackground:"#FFEEDA",iconUrl:async()=>(await c.e(7724).then(c.bind(c,57724))).default},bS={iconBackground:"#F50DB4",iconUrl:async()=>(await c.e(2852).then(c.bind(c,42852))).default},bT={iconBackground:"#f9f7ec",iconUrl:async()=>(await c.e(6817).then(c.bind(c,76817))).default},bU={iconBackground:"#000000",iconUrl:async()=>(await c.e(2821).then(c.bind(c,92821))).default},bV={iconBackground:"#f9f7ec",iconUrl:async()=>(await c.e(4340).then(c.bind(c,74340))).default},bW={iconBackground:"#000000",iconUrl:async()=>(await c.e(7983).then(c.bind(c,97983))).default},bX=Object.fromEntries(Object.values({apechain:{chainId:33139,name:"ApeChain",...by},apechainCurtis:{chainId:33111,name:"ApeChain Curtis",...by},arbitrum:{chainId:42161,name:"Arbitrum",...bz},arbitrumGoerli:{chainId:421613,...bz},arbitrumSepolia:{chainId:421614,...bz},avalanche:{chainId:43114,...bA},avalancheFuji:{chainId:43113,...bA},base:{chainId:8453,name:"Base",...bB},baseGoerli:{chainId:84531,...bB},baseSepolia:{chainId:84532,...bB},berachain:{chainId:80094,name:"Berachain",...bC},berachainArtio:{chainId:80085,name:"Berachain Artio",...bC},berachainBArtio:{chainId:80084,name:"Berachain bArtio",...bC},blast:{chainId:81457,name:"Blast",...bD},blastSepolia:{chainId:0xa0c71fd,...bD},bsc:{chainId:56,name:"BSC",...bE},bscTestnet:{chainId:97,...bE},celo:{chainId:42220,name:"Celo",...bF},celoAlfajores:{chainId:44787,name:"Celo Alfajores",...bF},cronos:{chainId:25,...bG},cronosTestnet:{chainId:338,...bG},degen:{chainId:0x27bc86aa,name:"Degen",iconBackground:"#A36EFD",iconUrl:async()=>(await c.e(6732).then(c.bind(c,56732))).default},flow:{chainId:747,...bI},flowTestnet:{chainId:545,...bI},gnosis:{chainId:100,name:"Gnosis",iconBackground:"#04795c",iconUrl:async()=>(await c.e(2586).then(c.bind(c,82586))).default},goerli:{chainId:5,...bH},gravity:{chainId:1625,name:"Gravity",...bJ},gravitySepolia:{chainId:13505,name:"Gravity Sepolia",...bJ},hardhat:{chainId:31337,iconBackground:"#f9f7ec",iconUrl:async()=>(await c.e(3689).then(c.bind(c,63689))).default},holesky:{chainId:17e3,...bH},hyperevm:{chainId:999,iconBackground:"#000000",iconUrl:async()=>(await c.e(2111).then(c.bind(c,22111))).default},ink:{chainId:57073,...bK},inkSepolia:{chainId:763373,...bK},kaia:{chainId:8217,name:"Kaia",...bL},kairos:{chainId:1001,name:"Kairos",...bL},kovan:{chainId:42,...bH},linea:{chainId:59144,name:"Linea",...bM},lineaGoerli:{chainId:59140,name:"Linea Goerli",...bM},lineaSepolia:{chainId:59141,name:"Linea Sepolia",...bM},localhost:{chainId:1337,...bH},mainnet:{chainId:1,name:"Ethereum",...bH},manta:{chainId:169,name:"Manta",...bN},mantaSepolia:{chainId:3441006,...bN},mantaTestnet:{chainId:3441005,...bN},mantle:{chainId:5e3,...bO},mantleTestnet:{chainId:5001,...bO},optimism:{chainId:10,name:"Optimism",...bP},optimismGoerli:{chainId:420,...bP},optimismKovan:{chainId:69,...bP},optimismSepolia:{chainId:0xaa37dc,...bP},polygon:{chainId:137,name:"Polygon",...bQ},polygonAmoy:{chainId:80002,...bQ},polygonMumbai:{chainId:80001,...bQ},rinkeby:{chainId:4,...bH},ronin:{chainId:2020,iconBackground:"#1273EA",iconUrl:async()=>(await c.e(6660).then(c.bind(c,26660))).default},ropsten:{chainId:3,...bH},sanko:{chainId:1996,name:"Sanko",iconBackground:"#000000",iconUrl:async()=>(await c.e(5633).then(c.bind(c,25633))).default},scroll:{chainId:534352,...bR},scrollSepolia:{chainId:534351,...bR},sepolia:{chainId:0xaa36a7,...bH},superposition:{chainId:55244,name:"Superposition",iconBackground:"#000000",iconUrl:async()=>(await c.e(2332).then(c.bind(c,62332))).default},unichain:{chainId:130,...bS},unichainSepolia:{chainId:1301,...bS},xdc:{chainId:50,name:"XDC",...bT},xdcTestnet:{chainId:51,...bT},zetachain:{chainId:7e3,name:"ZetaChain",...bU},zetachainAthensTestnet:{chainId:7001,name:"Zeta Athens",...bU},zkSync:{chainId:324,name:"zkSync",...bV},zkSyncTestnet:{chainId:280,...bV},zora:{chainId:7777777,name:"Zora",...bW},zoraSepolia:{chainId:0x3b9ac9ff,...bW},zoraTestnet:{chainId:999,...bW}}).filter(bx).map(({chainId:a,...b})=>[a,b])),bY=(0,u.createContext)({chains:[]});function bZ({children:a,initialChain:b}){let{chains:c}=(0,D.U)();return u.createElement(bY.Provider,{value:(0,u.useMemo)(()=>({chains:c.map(a=>{let b=bX[a.id]??{};return{...a,name:b.name??a.name,iconUrl:a.iconUrl??b.iconUrl,iconBackground:a.iconBackground??b.iconBackground}}),initialChainId:"number"==typeof b?b:b?.id}),[c,b])},a)}var b$=()=>(0,u.useContext)(bY).chains,b_=(0,u.createContext)({showBalance:void 0,setShowBalance:()=>{}});function b0({children:a}){let[b,c]=(0,u.useState)();return u.createElement(b_.Provider,{value:{showBalance:b,setShowBalance:c}},a)}var b1=()=>(0,u.useContext)(b_);function b2(){let[a,b]=(0,u.useState)(!1);return(0,u.useCallback)(()=>a,[a])}function b3(){let a=b$(),b=G.r.id;return a.some(a=>a.id===b)}async function b4(a,b){var c;if(b={headers:{},method:"get",...b,timeout:b.timeout??1e4},!a)throw Error("rainbowFetch: Missing url argument");let d=new AbortController,e=setTimeout(()=>d.abort(),b.timeout),{body:f,params:g,headers:h,...i}=b,j=f&&"object"==typeof f?JSON.stringify(b.body):b.body,k=await fetch(`${a}${(c=g)&&Object.keys(c).length?`?${new URLSearchParams(c)}`:""}`,{...i,body:j,headers:{Accept:"application/json","Content-Type":"application/json",...h},signal:d.signal});clearTimeout(e);let l=await function(a){let b=a.headers.get("Content-Type");return b?.startsWith("application/json")?a.json():a.text()}(k);if(k.ok){let{headers:a,status:b}=k;return{data:l,headers:a,status:b}}throw function({requestBody:a,response:b,responseBody:c}){let d=Error(c?.error||b?.statusText||"There was an error with the request.");return d.response=b,d.responseBody=c,d.requestBody=a,d}({requestBody:f,response:k,responseBody:"string"==typeof l?{error:l}:l})}var b5=class{constructor(a={}){let{baseUrl:b="",...c}=a;this.baseUrl=b,this.opts=c}get(a,b){return b4(`${this.baseUrl}${a}`,{...this.opts,...b||{},method:"get"})}delete(a,b){return b4(`${this.baseUrl}${a}`,{...this.opts,...b||{},method:"delete"})}head(a,b){return b4(`${this.baseUrl}${a}`,{...this.opts,...b||{},method:"head"})}options(a,b){return b4(`${this.baseUrl}${a}`,{...this.opts,...b||{},method:"options"})}post(a,b,c){return b4(`${this.baseUrl}${a}`,{...this.opts,...c||{},body:b,method:"post"})}put(a,b,c){return b4(`${this.baseUrl}${a}`,{...this.opts,...c||{},body:b,method:"put"})}patch(a,b,c){return b4(`${this.baseUrl}${a}`,{...this.opts,...c||{},body:b,method:"patch"})}},b6=!!("undefined"!=typeof process&&void 0!==process.env&&process.env.RAINBOW_PROVIDER_API_KEY),b7=function({baseUrl:a,headers:b,params:c,timeout:d}){return new b5({baseUrl:a,headers:b,params:c,timeout:d})}({baseUrl:"https://enhanced-provider.rainbow.me",headers:{"x-api-key":"undefined"!=typeof process&&void 0!==process.env&&process.env.RAINBOW_PROVIDER_API_KEY||"LzbasoBiLqltex3VkcQ7LRmL4PtfiiZ1EMJrizrgfonWN6byJReu/l6yrUoo3zLW"}});function b8(a){return`rk-ens-name-${a}`}async function b9({address:a}){let b=function(a){let b=function(a){try{let b=a?JSON.parse(a):null;return"object"==typeof b?b:null}catch{return null}}(localStorage.getItem(b8(a)));if(!b)return null;let{ensName:c,expires:d}=b;return"string"!=typeof c||Number.isNaN(Number(d))||new Date().getTime()>Number(d)?(localStorage.removeItem(b8(a)),null):c}(a);if(b)return b;let c=(await b7.get("/v1/resolve-ens",{params:{address:a}})).data.data;return c&&function(a,b){if(!(0,J.P)(a))return;let c=new Date(new Date().getTime()+180*6e4);localStorage.setItem(b8(a),JSON.stringify({ensName:b,expires:c.getTime()}))}(a,c),c}function ca({address:a,includeBalance:b}){let c=function(a){let b=b3(),{data:c}=(0,I.v)({chainId:G.r.id,address:a,query:{enabled:b}}),{data:d}=(0,H.I)({queryKey:function(a,b,c={}){return[a,b,c]}("address",a),queryFn:()=>b9({address:a}),enabled:!b&&!!a&&b6,staleTime:6e5,retry:1});return c||d}(a),d=function(a){let b=b3(),{data:c}=(0,F.$)({chainId:G.r.id,name:a?(a=>{try{return}catch{}})(a):void 0,query:{enabled:b}});return c}(c),{data:e}=(0,E.A)({address:b?a:void 0});return{ensName:c,ensAvatar:d,balance:e}}function cb(){let{chain:a}=(0,A.F)();return a?.id??null}var cc="rk-transactions";function cd(){var a="undefined"!=typeof localStorage?localStorage.getItem(cc):null;try{let b=a?JSON.parse(a):{};return"object"==typeof b?b:{}}catch{return{}}}var ce=/^0x([A-Fa-f0-9]{64})$/,cf=u.createContext(null);function cg({children:a}){let b=(0,K.e)(),{address:c}=(0,A.F)();cb();let{refetch:e}=(0,E.A)({address:c,query:{enabled:!1}}),[f]=u.useState(()=>d??(d=function({provider:a}){let b=cd(),c=a,d=new Set,e=new Set,f=new Map;function g(a,c){return b[a]?.[c]??[]}function h(a,b,c,d){j(a,b,a=>a.map(a=>a.hash===c?{...a,status:d}:a))}async function i(a,b){await Promise.all(g(a,b).filter(a=>"pending"===a.status).map(async d=>{let{confirmations:g,hash:i}=d,j=f.get(i);if(j)return await j;let k=c.waitForTransactionReceipt({confirmations:g,hash:i,timeout:3e5}).then(({status:c})=>{f.delete(i),void 0!==c&&(h(a,b,i,0===c||"reverted"===c?"failed":"confirmed"),function(a){for(let b of e)b(a)}(c))}).catch(()=>{h(a,b,i,"failed")});return f.set(i,k),await k}))}function j(a,c,e){(b=cd())[a]=b[a]??{};let f=0,g=e(b[a][c]??[]).filter(({status:a})=>"pending"===a||f++<=10);b[a][c]=g.length>0?g:void 0,localStorage.setItem(cc,JSON.stringify(b)),function(){for(let a of d)a()}(),i(a,c)}return{addTransaction:function(a,b,c){let d=function(a){let b=[];return ce.test(a.hash)||b.push("Invalid transaction hash"),"string"!=typeof a.description&&b.push("Transaction must have a description"),void 0!==a.confirmations&&(!Number.isInteger(a.confirmations)||a.confirmations<1)&&b.push("Transaction confirmations must be a positiver integer"),b}(c);if(d.length>0)throw Error(["Unable to add transaction",...d].join("\n"));j(a,b,a=>[{...c,status:"pending"},...a.filter(({hash:a})=>a!==c.hash)])},clearTransactions:function(a,b){j(a,b,()=>[])},getTransactions:g,onTransactionStatus:function(a){return e.add(a),()=>{e.delete(a)}},onChange:function(a){return d.add(a),()=>{d.delete(a)}},setProvider:function(a){c=a},waitForPendingTransactions:i}}({provider:b})));return u.useCallback(a=>{"success"===a&&e()},[e]),u.createElement(cf.Provider,{value:f},a)}function ch(){let a=u.useContext(cf);if(!a)throw Error("Transaction hooks must be used within RainbowKitProvider");return a}function ci(){let a=ch(),{address:b}=(0,A.F)(),c=cb(),[d,e]=(0,u.useState)(()=>a&&b&&c?a.getTransactions(b,c):[]);return d}var cj=a=>"function"==typeof a?a():a;function ck(a,{extends:b}={}){let c={...ak(a1,cj(a))};if(!b)return c;let d=ak(a1,cj(b));return Object.fromEntries(Object.entries(c).filter(([a,b])=>b!==d[a]))}function cl(a,b={}){return Object.entries(ck(a,b)).map(([a,b])=>`${a}:${b.replace(/[:;{}</>]/g,"")};`).join("")}var cm={appName:void 0,disclaimer:void 0,learnMoreUrl:"https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"},cn=(0,u.createContext)(cm),co=(0,u.createContext)(!1),cp=()=>{let[a,b]=(0,u.useState)({height:void 0,width:void 0});return(0,u.useEffect)(()=>{let a=function(a,b){let c;return()=>{c&&clearTimeout(c),c=setTimeout(()=>{c=null,a()},500)}}(()=>{b({height:window.innerHeight,width:window.innerWidth})},0);return window.addEventListener("resize",a),a(),()=>window.removeEventListener("resize",a)},[]),a},cq=(0,u.createContext)({connector:null,setConnector:()=>{}});function cr({children:a}){let[b,c]=(0,u.useState)(null);return u.createElement(cq.Provider,{value:(0,u.useMemo)(()=>({connector:b,setConnector:c}),[b])},a)}var cs={COMPACT:"compact",WIDE:"wide"},ct=(0,u.createContext)(cs.WIDE);function cu({children:a,modalSize:b}){let{width:c}=cp(),{connector:d}=(0,u.useContext)(cq);return u.createElement(ct.Provider,{value:c&&c<768||d?cs.COMPACT:b},a)}var cv=(0,u.createContext)(!1);function cw(){return"undefined"!=typeof navigator&&void 0!==navigator.userAgent&&/Version\/([0-9._]+).*Safari/.test(navigator.userAgent)}function cx(){if("undefined"==typeof navigator)return"Browser";let a=navigator.userAgent?.toLowerCase();return navigator.brave?.isBrave?"Brave":a?.indexOf("edg/")>-1?"Edge":a?.indexOf("op")>-1?"Opera":"undefined"!=typeof document&&""!==getComputedStyle(document.body).getPropertyValue("--arc-palette-focus")?"Arc":a?.indexOf("chrome")>-1?"Chrome":a?.indexOf("firefox")>-1?"Firefox":cw()?"Safari":"Browser"}var{os:cy}=(0,am.UAParser)();function cz(){return"Windows"===cy.name?"Windows":"Mac OS"===cy.name?"macOS":["Ubuntu","Mint","Fedora","Debian","Arch","Linux"].includes(cy.name)?"Linux":"Desktop"}var cA=a=>{let b=cx();return({Arc:a?.downloadUrls?.chrome,Brave:a?.downloadUrls?.chrome,Chrome:a?.downloadUrls?.chrome,Edge:a?.downloadUrls?.edge||a?.downloadUrls?.chrome,Firefox:a?.downloadUrls?.firefox,Opera:a?.downloadUrls?.opera||a?.downloadUrls?.chrome,Safari:a?.downloadUrls?.safari,Browser:a?.downloadUrls?.browserExtension})[b]??a?.downloadUrls?.browserExtension},cB=a=>(bb()?a?.downloadUrls?.ios:a?.downloadUrls?.android)??a?.downloadUrls?.mobile,cC=a=>{let b=cz();return({Windows:a?.downloadUrls?.windows,macOS:a?.downloadUrls?.macos,Linux:a?.downloadUrls?.linux,Desktop:a?.downloadUrls?.desktop})[b]??a?.downloadUrls?.desktop},cD=(a,b)=>a.some(a=>a.id===b),cE=a=>!!a.isRainbowKitConnector,cF=a=>!!(!a.isRainbowKitConnector&&a.icon?.replace(/\n/g,"").startsWith("data:image")&&a.uid&&a.name),cG="rk-recent";function cH(){return"undefined"!=typeof localStorage?function(a){try{let b=a?JSON.parse(a):[];return Array.isArray(b)?b:[]}catch{return[]}}(localStorage.getItem(cG)):[]}function cI(a=!1){let b=b$(),c=(0,u.useContext)(bY).initialChainId,{connectAsync:d,connectors:e}=(0,al.e)(),{setIsWalletConnectModalOpen:f}=eb(),g=e.map(a=>({...a,...a.rkDetails||{}}));async function h(a){let e=await a.getChainId(),f=await d({chainId:c??b.find(({id:a})=>a===e)?.id??b[0]?.id,connector:a});return f&&function(a){let b=[...new Set([a,...cH()])];localStorage.setItem(cG,JSON.stringify(b))}(a.id),f}async function i(a){try{f(!0),await h(a),f(!1)}catch(b){let a="UserRejectedRequestError"===b.name||"Connection request reset. Please try again."===b.message;if(f(!1),!a)throw b}}let j=async(a,b)=>{let c=await a.getProvider();return"coinbase"===a.id?c.qrUrl:new Promise(a=>c.once("display_uri",c=>{a(b(c))}))},k=g.find(a=>"walletConnect"===a.id&&a.isWalletConnectModalConnector),l=g.filter(cF).map(a=>({...a,groupIndex:0})),m=g.filter(cE).filter(a=>!a.isWalletConnectModalConnector).filter(b=>!a||!l.some(a=>a.id===b.rdns)).map(a=>"walletConnect"===a.id&&k?{...a,walletConnectModalConnector:k}:a),n=[...l,...m],o=function(a,b){let c={};for(let d of a){let a=b(d);a&&(c[a]=d)}return c}(n,a=>a.id),p=cH().map(a=>o[a]).filter(Boolean).slice(0,3),q=[];for(let a of(({wallets:a,recentWallets:b})=>[...b,...a.filter(a=>!cD(b,a.id))])({wallets:n,recentWallets:p})){if(!a)continue;let b=cF(a),c=cD(p,a.id);if(b){q.push({...a,iconUrl:a.icon,ready:!0,connect:()=>h(a),groupName:"Installed",recent:c});continue}q.push({...a,ready:a.installed??!0,connect:()=>h(a),desktopDownloadUrl:cC(a),extensionDownloadUrl:cA(a),groupName:a.groupName,mobileDownloadUrl:cB(a),getQrCodeUri:a.qrCode?.getUri?()=>j(a,a.qrCode.getUri):void 0,getDesktopUri:a.desktop?.getUri?()=>j(a,a.desktop.getUri):void 0,getMobileUri:a.mobile?.getUri?()=>j(a,a.mobile?.getUri):void 0,recent:c,showWalletConnectModal:a.walletConnectModalConnector?()=>i(a.walletConnectModalConnector):void 0})}return q}var cJ=async()=>(await c.e(7275).then(c.bind(c,37275))).default,cK=()=>u.createElement(bk,{background:"#d0d5de",borderRadius:"10",height:"48",src:cJ,width:"48"}),cL=async()=>(await c.e(4305).then(c.bind(c,84305))).default,cM=()=>u.createElement(bk,{background:"#d0d5de",borderRadius:"10",height:"48",src:cL,width:"48"}),cN=u.forwardRef(({as:a="div",children:b,className:c,color:d,display:e,font:f="body",id:g,size:h="16",style:i,tabIndex:j,textAlign:k="inherit",weight:l="regular",testId:m},n)=>u.createElement(be,{as:a,className:c,color:d,display:e,fontFamily:f,fontSize:h,fontWeight:l,id:g,ref:n,style:i,tabIndex:j,textAlign:k,testId:m},b));cN.displayName="Text";var cO={large:{fontSize:"16",paddingX:"24",paddingY:"10"},medium:{fontSize:"14",height:"28",paddingX:"12",paddingY:"4"},small:{fontSize:"14",paddingX:"10",paddingY:"5"}};function cP({disabled:a=!1,href:b,label:c,onClick:d,rel:e="noreferrer noopener",size:f="medium",target:g="_blank",testId:h,type:i="primary"}){let j="primary"===i,k="large"!==f,l=bc(),m=a?"actionButtonSecondaryBackground":j?"accentColor":k?"actionButtonSecondaryBackground":null,{fontSize:n,height:o,paddingX:p,paddingY:q}=cO[f];return u.createElement(be,{...b?!a?{as:"a",href:b,rel:e,target:g}:{}:{as:"button",type:"button"},onClick:a?void 0:d,...!l||!k?{borderColor:!l||k||j?"actionButtonBorder":"actionButtonBorderMobile",borderStyle:"solid",borderWidth:"1"}:{},borderRadius:"actionButton",className:!a&&a4({active:"shrinkSm",hover:"grow"}),display:"block",paddingX:p,paddingY:q,style:{willChange:"transform"},testId:h,textAlign:"center",transition:"transform",...m?{background:m}:{},...o?{height:o}:{}},u.createElement(cN,{color:a?"modalTextSecondary":j?"accentColorForeground":"accentColor",size:n,weight:"bold"},c))}var cQ=()=>bc()?u.createElement("svg",{"aria-hidden":!0,fill:"none",height:"11.5",viewBox:"0 0 11.5 11.5",width:"11.5",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Close"),u.createElement("path",{d:"M2.13388 0.366117C1.64573 -0.122039 0.854272 -0.122039 0.366117 0.366117C-0.122039 0.854272 -0.122039 1.64573 0.366117 2.13388L3.98223 5.75L0.366117 9.36612C-0.122039 9.85427 -0.122039 10.6457 0.366117 11.1339C0.854272 11.622 1.64573 11.622 2.13388 11.1339L5.75 7.51777L9.36612 11.1339C9.85427 11.622 10.6457 11.622 11.1339 11.1339C11.622 10.6457 11.622 9.85427 11.1339 9.36612L7.51777 5.75L11.1339 2.13388C11.622 1.64573 11.622 0.854272 11.1339 0.366117C10.6457 -0.122039 9.85427 -0.122039 9.36612 0.366117L5.75 3.98223L2.13388 0.366117Z",fill:"currentColor"})):u.createElement("svg",{"aria-hidden":!0,fill:"none",height:"10",viewBox:"0 0 10 10",width:"10",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Close"),u.createElement("path",{d:"M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z",fill:"currentColor"})),cR=({"aria-label":a="Close",onClose:b})=>{let c=bc();return u.createElement(be,{alignItems:"center","aria-label":a,as:"button",background:"closeButtonBackground",borderColor:"actionButtonBorder",borderRadius:"full",borderStyle:"solid",borderWidth:c?"0":"1",className:a4({active:"shrinkSm",hover:"growLg"}),color:"closeButton",display:"flex",height:c?"30":"28",justifyContent:"center",onClick:b,style:{willChange:"transform"},transition:"default",type:"button",width:c?"30":"28"},u.createElement(cQ,null))},cS=async()=>(await c.e(8723).then(c.bind(c,8723))).default;function cT({onClose:a,onCloseModal:b}){let{i18n:c}=(0,u.useContext)(bv),[{status:d,...e},f]=u.useState({status:"idle"}),g=function(){let{adapter:a}=(0,u.useContext)(a6)??{};if(!a)throw Error("No authentication adapter found");return a}(),h=(0,u.useCallback)(async()=>{try{let a=await g.getNonce();f(b=>({...b,nonce:a}))}catch{f(a=>({...a,errorMessage:c.t("sign_in.message.preparing_error"),status:"idle"}))}},[g,c.t]),i=(0,u.useRef)(!1);u.useEffect(()=>{i.current||(i.current=!0,h())},[h]);let j=bc(),{address:k,chain:l}=(0,A.F)(),{signMessageAsync:m}=(0,ao.Y)(),n=async()=>{try{let a,d=l?.id,{nonce:h}=e;if(!k||!d||!h)return;f(a=>({...a,errorMessage:void 0,status:"signing"}));let i=g.createMessage({address:k,chainId:d,nonce:h});try{a=await m({message:i})}catch(a){if(a instanceof an.vx)return f(a=>({...a,status:"idle"}));return f(a=>({...a,errorMessage:c.t("sign_in.signature.signing_error"),status:"idle"}))}f(a=>({...a,status:"verifying"}));try{if(await g.verify({message:i,signature:a}))return void b();throw Error()}catch{return f(a=>({...a,errorMessage:c.t("sign_in.signature.verifying_error"),status:"idle"}))}}catch{f({errorMessage:c.t("sign_in.signature.oops_error"),status:"idle"})}};return u.createElement(be,{position:"relative"},u.createElement(be,{display:"flex",paddingRight:"16",paddingTop:"16",position:"absolute",right:"0"},u.createElement(cR,{onClose:a})),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:j?"32":"24",padding:"24",paddingX:"18",style:{paddingTop:j?"60px":"36px"}},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:j?"6":"4",style:{maxWidth:j?320:280}},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:j?"32":"16"},u.createElement(bk,{height:40,src:cS,width:40}),u.createElement(cN,{color:"modalText",size:j?"20":"18",textAlign:"center",weight:"heavy"},c.t("sign_in.label"))),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:j?"16":"12"},u.createElement(cN,{color:"modalTextSecondary",size:j?"16":"14",textAlign:"center"},c.t("sign_in.description")),"idle"===d&&e.errorMessage?u.createElement(cN,{color:"error",size:j?"16":"14",textAlign:"center",weight:"bold"},e.errorMessage):null)),u.createElement(be,{alignItems:j?void 0:"center",display:"flex",flexDirection:"column",gap:"8",width:"full"},u.createElement(cP,{disabled:!e.nonce||"signing"===d||"verifying"===d,label:e.nonce?"signing"===d?c.t("sign_in.signature.waiting"):"verifying"===d?c.t("sign_in.signature.verifying"):c.t("sign_in.message.send"):c.t("sign_in.message.preparing"),onClick:n,size:j?"large":"medium",testId:"auth-message-button"}),j?u.createElement(cP,{label:"Cancel",onClick:a,size:"large",type:"secondary"}):u.createElement(be,{as:"button",borderRadius:"full",className:a4({active:"shrink",hover:"grow"}),display:"block",onClick:a,paddingX:"10",paddingY:"5",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},u.createElement(cN,{color:"closeButton",size:j?"16":"14",weight:"bold"},c.t("sign_in.message.cancel"))))))}var cU="WALLETCONNECT_DEEPLINK_CHOICE";function cV(){localStorage.removeItem(cU)}var cW=(0,u.createContext)(void 0),cX="data-rk",cY=a=>({[cX]:a||""}),cZ=p();function c$({appInfo:a,avatar:b,children:c,coolMode:d=!1,id:e,initialChain:f,locale:g,modalSize:h=cs.WIDE,showRecentTransactions:i=!1,theme:j=cZ}){let k=b$(),l=cI(),m="unauthenticated"===a8();if((0,u.useCallback)(()=>{bi(...l.map(a=>a.iconUrl),...k.map(a=>a.iconUrl).filter(bx)),bc()||(bi(cJ),bi(cL)),m&&bi(cS)},[l,k,m]),(0,u.useCallback)(()=>{!function({version:a}){localStorage.setItem("rk-version",a)}({version:"2.2.8"})},[]),(0,B.U)({onDisconnect:cV}),"function"==typeof j)throw Error('A theme function was provided to the "theme" prop instead of a theme object. You must execute this function to get the resulting theme object.');let n=(a=>{if(a&&!/^[a-zA-Z0-9_]+$/.test(a))throw Error(`Invalid ID: ${a}`);return a?`[${cX}="${a}"]`:`[${cX}]`})(e),o={...cm,...a};return u.createElement(bZ,{initialChain:f},u.createElement(cr,null,u.createElement(bw,{locale:g},u.createElement(co.Provider,{value:d},u.createElement(cu,{modalSize:h},u.createElement(cv.Provider,{value:i},u.createElement(cg,null,u.createElement(bo.Provider,{value:b??bn},u.createElement(cn.Provider,{value:o},u.createElement(cW.Provider,{value:e},u.createElement(b0,null,u.createElement(d7,null,j?u.createElement("div",{...cY(e)},u.createElement("style",{dangerouslySetInnerHTML:{__html:[`${n}{${cl("lightMode"in j?j.lightMode:j)}}`,"darkMode"in j?`@media(prefers-color-scheme:dark){${n}{${cl(j.darkMode,{extends:j.lightMode})}}}`:null].join("")}}),c):c))))))))))))}var c_=(a,b)=>{let c=a.querySelectorAll("button:not(:disabled), a[href]");0!==c.length&&c["end"===b?c.length-1:0].focus()};function c0(a){let b=(0,u.useRef)(null);return u.createElement(u.Fragment,null,u.createElement("div",{onFocus:(0,u.useCallback)(()=>b.current&&c_(b.current,"end"),[]),tabIndex:0}),u.createElement("div",{ref:b,style:{outline:"none"},tabIndex:-1,...a}),u.createElement("div",{onFocus:(0,u.useCallback)(()=>b.current&&c_(b.current,"start"),[]),tabIndex:0}))}var c1=a=>a.stopPropagation();function c2({children:a,onClose:b,open:c,titleId:d}){(0,u.useEffect)(()=>{let a=a=>c&&"Escape"===a.key&&b();return document.addEventListener("keydown",a),()=>document.removeEventListener("keydown",a)},[c,b]);let[e,f]=(0,u.useState)(!0);(0,u.useEffect)(()=>{f("hidden"!==getComputedStyle(window.document.body).overflow)},[]);let g=(0,u.useCallback)(()=>b(),[b]),h=cY((0,u.useContext)(cW)),i=bc();return u.createElement(u.Fragment,null,c?(0,M.createPortal)(u.createElement(ai,{enabled:e},u.createElement(be,{...h},u.createElement(be,{...h,alignItems:i?"flex-end":"center","aria-labelledby":d,"aria-modal":!0,className:"_9pm4ki3 ju367v9h ju367vb3 ju367va ju367v2q ju367v8q",onClick:g,position:"fixed",role:"dialog"},u.createElement(c0,{className:"_9pm4ki5 ju367va ju367v15 ju367v8r",onClick:c1,role:"document"},a)))),document.body):null)}var c3="_1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r",c4="_1ckjpok6 ju367vq";function c5({bottomSheetOnMobile:a=!1,children:b,marginTop:c,padding:d="16",paddingBottom:e,wide:f=!1}){let g=bc(),h=(0,u.useContext)(ct)===cs.COMPACT;return u.createElement(be,{marginTop:c},u.createElement(be,{className:[f?g?"_1ckjpok2 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r":h?"_1ckjpok4 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r":"_1ckjpok3 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r":c3,g?c4:null,g&&a?"_1ckjpok7":null].join(" ")},u.createElement(be,{padding:d,paddingBottom:e??d},b)))}var c6=["k","m","b","t"];function c7(a,b=1){return a.toString().replace(RegExp(`(.+\\.\\d{${b}})\\d+`),"$1").replace(/(\.[1-9]*)0+$/,"$1").replace(/\.$/,"")}function c8(a){if(a<1)return c7(a,3);if(a<100)return c7(a,2);if(a<1e4)return new Intl.NumberFormat().format(Number.parseFloat(c7(a,1)));let b=String(a);for(let c=c6.length-1;c>=0;c--){let d=10**((c+1)*3);if(d<=a){b=c7(a=10*a/d/10,1)+c6[c];break}}return b}function c9(a){return a.length<8?a:`${a.substring(0,4)}\u2026${a.substring(a.length-4)}`}function da(a){if(!a)return"";let b=a.split("."),c=b.pop();return b.join(".").length>24?`${b.join(".").substring(0,24)}...`:`${b.join(".")}.${c}`}var db=()=>u.createElement("svg",{fill:"none",height:"13",viewBox:"0 0 13 13",width:"13",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Copied"),u.createElement("path",{d:"M4.94568 12.2646C5.41052 12.2646 5.77283 12.0869 6.01892 11.7109L12.39 1.96973C12.5677 1.69629 12.6429 1.44336 12.6429 1.2041C12.6429 0.561523 12.1644 0.0966797 11.5082 0.0966797C11.057 0.0966797 10.7767 0.260742 10.5033 0.691406L4.9115 9.50977L2.07458 5.98926C1.82166 5.68848 1.54822 5.55176 1.16541 5.55176C0.502319 5.55176 0.0238037 6.02344 0.0238037 6.66602C0.0238037 6.95312 0.112671 7.20605 0.358765 7.48633L3.88611 11.7588C4.18005 12.1074 4.50818 12.2646 4.94568 12.2646Z",fill:"currentColor"})),dc=()=>u.createElement("svg",{fill:"none",height:"16",viewBox:"0 0 17 16",width:"17",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Copy"),u.createElement("path",{d:"M3.04236 12.3027H4.18396V13.3008C4.18396 14.8525 5.03845 15.7002 6.59705 15.7002H13.6244C15.183 15.7002 16.0375 14.8525 16.0375 13.3008V6.24609C16.0375 4.69434 15.183 3.84668 13.6244 3.84668H12.4828V2.8418C12.4828 1.29688 11.6283 0.442383 10.0697 0.442383H3.04236C1.48376 0.442383 0.629272 1.29004 0.629272 2.8418V9.90332C0.629272 11.4551 1.48376 12.3027 3.04236 12.3027ZM3.23376 10.5391C2.68689 10.5391 2.39294 10.2656 2.39294 9.68457V3.06055C2.39294 2.47949 2.68689 2.21289 3.23376 2.21289H9.8783C10.4252 2.21289 10.7191 2.47949 10.7191 3.06055V3.84668H6.59705C5.03845 3.84668 4.18396 4.69434 4.18396 6.24609V10.5391H3.23376ZM6.78845 13.9365C6.24158 13.9365 5.94763 13.6699 5.94763 13.0889V6.45801C5.94763 5.87695 6.24158 5.61035 6.78845 5.61035H13.433C13.9799 5.61035 14.2738 5.87695 14.2738 6.45801V13.0889C14.2738 13.6699 13.9799 13.9365 13.433 13.9365H6.78845Z",fill:"currentColor"})),dd=()=>u.createElement("svg",{fill:"none",height:"16",viewBox:"0 0 18 16",width:"18",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Disconnect"),u.createElement("path",{d:"M2.67834 15.5908H9.99963C11.5514 15.5908 12.399 14.7432 12.399 13.1777V10.2656H10.6354V12.9863C10.6354 13.5332 10.3688 13.8271 9.78772 13.8271H2.89026C2.3092 13.8271 2.0426 13.5332 2.0426 12.9863V3.15625C2.0426 2.60254 2.3092 2.30859 2.89026 2.30859H9.78772C10.3688 2.30859 10.6354 2.60254 10.6354 3.15625V5.89746H12.399V2.95801C12.399 1.39941 11.5514 0.544922 9.99963 0.544922H2.67834C1.12659 0.544922 0.278931 1.39941 0.278931 2.95801V13.1777C0.278931 14.7432 1.12659 15.5908 2.67834 15.5908ZM7.43616 8.85059H14.0875L15.0924 8.78906L14.566 9.14453L13.6842 9.96484C13.5406 10.1016 13.4586 10.2861 13.4586 10.4844C13.4586 10.8398 13.7321 11.168 14.1217 11.168C14.3199 11.168 14.4635 11.0928 14.6002 10.9561L16.7809 8.68652C16.986 8.48145 17.0543 8.27637 17.0543 8.06445C17.0543 7.85254 16.986 7.64746 16.7809 7.43555L14.6002 5.17285C14.4635 5.03613 14.3199 4.9541 14.1217 4.9541C13.7321 4.9541 13.4586 5.27539 13.4586 5.6377C13.4586 5.83594 13.5406 6.02734 13.6842 6.15723L14.566 6.98438L15.0924 7.33984L14.0875 7.27148H7.43616C7.01917 7.27148 6.65686 7.62012 6.65686 8.06445C6.65686 8.50195 7.01917 8.85059 7.43616 8.85059Z",fill:"currentColor"})),de=a=>a?.blockExplorers?.default?.url,df=()=>u.createElement("svg",{fill:"none",height:"19",viewBox:"0 0 20 19",width:"20",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Link"),u.createElement("path",{d:"M10 18.9443C15.0977 18.9443 19.2812 14.752 19.2812 9.6543C19.2812 4.56543 15.0889 0.373047 10 0.373047C4.90234 0.373047 0.71875 4.56543 0.71875 9.6543C0.71875 14.752 4.91113 18.9443 10 18.9443ZM10 16.6328C6.1416 16.6328 3.03906 13.5215 3.03906 9.6543C3.03906 5.7959 6.13281 2.68457 10 2.68457C13.8584 2.68457 16.9697 5.7959 16.9697 9.6543C16.9785 13.5215 13.8672 16.6328 10 16.6328ZM12.7158 12.1416C13.2432 12.1416 13.5684 11.7549 13.5684 11.1836V7.19336C13.5684 6.44629 13.1377 6.05957 12.417 6.05957H8.40918C7.8291 6.05957 7.45117 6.38477 7.45117 6.91211C7.45117 7.43945 7.8291 7.77344 8.40918 7.77344H9.69238L10.7207 7.63281L9.53418 8.67871L6.73047 11.4912C6.53711 11.6758 6.41406 11.9395 6.41406 12.2031C6.41406 12.7832 6.85352 13.1699 7.39844 13.1699C7.68848 13.1699 7.92578 13.0732 8.1543 12.8623L10.9316 10.0762L11.9775 8.89844L11.8545 9.98828V11.1836C11.8545 11.7725 12.1885 12.1416 12.7158 12.1416Z",fill:"currentColor"})),dg=()=>u.createElement("svg",{fill:"none",height:"19",viewBox:"0 0 20 19",width:"20",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Cancel"),u.createElement("path",{d:"M10 18.9443C15.0977 18.9443 19.2812 14.752 19.2812 9.6543C19.2812 4.56543 15.0889 0.373047 10 0.373047C4.90234 0.373047 0.71875 4.56543 0.71875 9.6543C0.71875 14.752 4.91113 18.9443 10 18.9443ZM10 16.6328C6.1416 16.6328 3.03906 13.5215 3.03906 9.6543C3.03906 5.7959 6.13281 2.68457 10 2.68457C13.8584 2.68457 16.9697 5.7959 16.9697 9.6543C16.9785 13.5215 13.8672 16.6328 10 16.6328ZM7.29297 13.3018C7.58301 13.3018 7.81152 13.2139 7.99609 13.0205L10 11.0166L12.0127 13.0205C12.1973 13.2051 12.4258 13.3018 12.707 13.3018C13.2432 13.3018 13.6562 12.8887 13.6562 12.3525C13.6562 12.0977 13.5508 11.8691 13.3662 11.6934L11.3535 9.67188L13.375 7.6416C13.5596 7.44824 13.6562 7.22852 13.6562 6.98242C13.6562 6.44629 13.2432 6.0332 12.7158 6.0332C12.4346 6.0332 12.2148 6.12109 12.0215 6.31445L10 8.32715L7.9873 6.32324C7.80273 6.12988 7.58301 6.04199 7.29297 6.04199C6.76562 6.04199 6.35254 6.45508 6.35254 6.99121C6.35254 7.2373 6.44922 7.46582 6.63379 7.6416L8.65527 9.67188L6.63379 11.6934C6.44922 11.8691 6.35254 12.1064 6.35254 12.3525C6.35254 12.8887 6.76562 13.3018 7.29297 13.3018Z",fill:"currentColor"})),dh=()=>u.createElement("svg",{fill:"none",height:"20",viewBox:"0 0 20 20",width:"20",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Success"),u.createElement("path",{d:"M10 19.4443C15.0977 19.4443 19.2812 15.252 19.2812 10.1543C19.2812 5.06543 15.0889 0.873047 10 0.873047C4.90234 0.873047 0.71875 5.06543 0.71875 10.1543C0.71875 15.252 4.91113 19.4443 10 19.4443ZM10 17.1328C6.1416 17.1328 3.03906 14.0215 3.03906 10.1543C3.03906 6.2959 6.13281 3.18457 10 3.18457C13.8584 3.18457 16.9697 6.2959 16.9697 10.1543C16.9785 14.0215 13.8672 17.1328 10 17.1328ZM9.07715 14.3379C9.4375 14.3379 9.7627 14.1533 9.97363 13.8369L13.7441 8.00977C13.8848 7.79883 13.9814 7.5791 13.9814 7.36816C13.9814 6.84961 13.5244 6.48926 13.0322 6.48926C12.707 6.48926 12.4258 6.66504 12.2148 7.0166L9.05957 12.0967L7.5918 10.2949C7.37207 10.0225 7.13477 9.9082 6.84473 9.9082C6.33496 9.9082 5.92188 10.3125 5.92188 10.8223C5.92188 11.0684 6.00098 11.2793 6.18555 11.5078L8.1543 13.8545C8.40918 14.1709 8.70801 14.3379 9.07715 14.3379Z",fill:"currentColor"}));function di({tx:a}){let b=bc(),c=(a=>{switch(a){case"pending":default:return bl;case"confirmed":return dh;case"failed":return dg}})(a.status),d="failed"===a.status?"error":"accentColor",{chain:e}=(0,A.F)(),f="confirmed"===a.status?"Confirmed":"failed"===a.status?"Failed":"Pending",g=de(e);return u.createElement(u.Fragment,null,u.createElement(be,{...g?{as:"a",background:{hover:"profileForeground"},borderRadius:"menuButton",className:a4({active:"shrink"}),href:`${g}/tx/${a.hash}`,rel:"noreferrer noopener",target:"_blank",transition:"default"}:{},color:"modalText",display:"flex",flexDirection:"row",justifyContent:"space-between",padding:"8",width:"full"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:b?"16":"14"},u.createElement(be,{color:d},u.createElement(c,null)),u.createElement(be,{display:"flex",flexDirection:"column",gap:b?"3":"1"},u.createElement(be,null,u.createElement(cN,{color:"modalText",font:"body",size:b?"16":"14",weight:"bold"},a?.description)),u.createElement(be,null,u.createElement(cN,{color:"pending"===a.status?"modalTextSecondary":d,font:"body",size:"14",weight:b?"medium":"regular"},f)))),g&&u.createElement(be,{alignItems:"center",color:"modalTextDim",display:"flex"},u.createElement(df,null))))}function dj({address:a}){let b=ci(),c=function(){let a=ch(),{address:b}=(0,A.F)(),c=cb();return(0,u.useCallback)(()=>{if(!b||!c)throw Error("No address or chain ID found");a.clearTransactions(b,c)},[a,b,c])}(),{chain:d}=(0,A.F)(),e=de(d),f=b.slice(0,3),g=f.length>0,h=bc(),{appName:i}=(0,u.useContext)(cn),{i18n:j}=(0,u.useContext)(bv);return u.createElement(u.Fragment,null,u.createElement(be,{display:"flex",flexDirection:"column",gap:"10",paddingBottom:"2",paddingTop:"16",paddingX:h?"8":"18"},g&&u.createElement(be,{paddingBottom:h?"4":"0",paddingTop:"8",paddingX:h?"12":"6"},u.createElement(be,{display:"flex",justifyContent:"space-between"},u.createElement(cN,{color:"modalTextSecondary",size:h?"16":"14",weight:"semibold"},j.t("profile.transactions.recent.title")),u.createElement(be,{style:{marginBottom:-6,marginLeft:-10,marginRight:-10,marginTop:-6}},u.createElement(be,{as:"button",background:{hover:"profileForeground"},borderRadius:"actionButton",className:a4({active:"shrink"}),onClick:c,paddingX:h?"8":"12",paddingY:h?"4":"5",transition:"default",type:"button"},u.createElement(cN,{color:"modalTextSecondary",size:h?"16":"14",weight:"semibold"},j.t("profile.transactions.clear.label")))))),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},g?f.map(a=>u.createElement(di,{key:a.hash,tx:a})):u.createElement(u.Fragment,null,u.createElement(be,{padding:h?"12":"8"},u.createElement(cN,{color:"modalTextDim",size:h?"16":"14",weight:h?"medium":"bold"},i?j.t("profile.transactions.description",{appName:i}):j.t("profile.transactions.description_fallback"))),h&&u.createElement(be,{background:"generalBorderDim",height:"1",marginX:"12",marginY:"8"})))),e&&u.createElement(be,{paddingBottom:"18",paddingX:h?"8":"18"},u.createElement(be,{alignItems:"center",as:"a",background:{hover:"profileForeground"},borderRadius:"menuButton",className:a4({active:"shrink"}),color:"modalTextDim",display:"flex",flexDirection:"row",href:`${e}/address/${a}`,justifyContent:"space-between",paddingX:"8",paddingY:"12",rel:"noreferrer noopener",style:{willChange:"transform"},target:"_blank",transition:"default",width:"full",...h?{paddingLeft:"12"}:{}},u.createElement(cN,{color:"modalText",font:"body",size:h?"16":"14",weight:h?"semibold":"bold"},j.t("profile.explorer.label")),u.createElement(df,null))))}function dk({action:a,icon:b,label:c,testId:d,url:e}){let f=bc();return u.createElement(be,{...e?{as:"a",href:e,rel:"noreferrer noopener",target:"_blank"}:{as:"button",type:"button"},background:{base:"profileAction",...!f?{hover:"profileActionHover"}:{}},borderRadius:"menuButton",boxShadow:"profileDetailsAction",className:a4({active:"shrinkSm",hover:f?void 0:"grow"}),display:"flex",onClick:a,padding:f?"6":"8",style:{willChange:"transform"},testId:d,transition:"default",width:"full"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"1",justifyContent:"center",paddingTop:"2",width:"full"},u.createElement(be,{color:"modalText",height:"max"},b),u.createElement(be,null,u.createElement(cN,{color:"modalText",size:f?"12":"13",weight:"semibold"},c))))}function dl({address:a,ensAvatar:b,ensName:c,balance:d,onClose:e,onDisconnect:f}){let g=(0,u.useContext)(cv),[h,i]=(0,u.useState)(!1),j=(0,u.useCallback)(()=>{a&&(navigator.clipboard.writeText(a),i(!0))},[a]);if(!a)return null;let k=c?da(c):c9(a),l=d?.formatted,m=l?c8(Number.parseFloat(l)):void 0,n="rk_profile_title",o=bc(),{i18n:p}=(0,u.useContext)(bv);return u.createElement(u.Fragment,null,u.createElement(be,{display:"flex",flexDirection:"column"},u.createElement(be,{background:"profileForeground",padding:"16"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:o?"16":"12",justifyContent:"center",margin:"8",style:{textAlign:"center"}},u.createElement(be,{style:{position:"absolute",right:16,top:16,willChange:"transform"}},u.createElement(cR,{onClose:e}))," ",u.createElement(be,{marginTop:o?"24":"0"},u.createElement(bp,{address:a,imageUrl:b,size:o?82:74})),u.createElement(be,{display:"flex",flexDirection:"column",gap:o?"4":"0",textAlign:"center"},u.createElement(be,{textAlign:"center"},u.createElement(cN,{as:"h1",color:"modalText",id:n,size:o?"20":"18",weight:"heavy"},k)),!!d&&u.createElement(be,{textAlign:"center"},u.createElement(cN,{as:"h1",color:"modalTextSecondary",id:n,size:o?"16":"14",weight:"semibold"},m," ",d.symbol)))),u.createElement(be,{display:"flex",flexDirection:"row",gap:"8",margin:"2",marginTop:"16"},u.createElement(dk,{action:j,icon:h?u.createElement(db,null):u.createElement(dc,null),label:h?p.t("profile.copy_address.copied"):p.t("profile.copy_address.label")}),u.createElement(dk,{action:f,icon:u.createElement(dd,null),label:p.t("profile.disconnect.label"),testId:"disconnect-button"}))),g&&u.createElement(u.Fragment,null,u.createElement(be,{background:"generalBorder",height:"1",marginTop:"-1"}),u.createElement(be,null,u.createElement(dj,{address:a})))))}function dm({onClose:a,open:b}){let{address:c}=(0,A.F)(),{balance:d,ensAvatar:e,ensName:f}=ca({address:c,includeBalance:b}),{disconnect:g}=(0,L.u)();return c?u.createElement(u.Fragment,null,c&&u.createElement(c2,{onClose:a,open:b,titleId:"rk_account_modal_title"},u.createElement(c5,{bottomSheetOnMobile:!0,padding:"0"},u.createElement(dl,{address:c,ensAvatar:e,ensName:f,balance:d,onClose:a,onDisconnect:g})))):null}var dn=({size:a})=>u.createElement("svg",{fill:"none",height:a,viewBox:"0 0 28 28",width:a,xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Disconnect"),u.createElement("path",{d:"M6.742 22.195h8.367c1.774 0 2.743-.968 2.743-2.758V16.11h-2.016v3.11c0 .625-.305.96-.969.96H6.984c-.664 0-.968-.335-.968-.96V7.984c0-.632.304-.968.968-.968h7.883c.664 0 .969.336.969.968v3.133h2.016v-3.36c0-1.78-.97-2.757-2.743-2.757H6.742C4.97 5 4 5.977 4 7.758v11.68c0 1.789.969 2.757 2.742 2.757Zm5.438-7.703h7.601l1.149-.07-.602.406-1.008.938a.816.816 0 0 0-.258.593c0 .407.313.782.758.782.227 0 .39-.086.547-.243l2.492-2.593c.235-.235.313-.47.313-.711 0-.242-.078-.477-.313-.719l-2.492-2.586c-.156-.156-.32-.25-.547-.25-.445 0-.758.367-.758.781 0 .227.094.446.258.594l1.008.945.602.407-1.149-.079H12.18a.904.904 0 0 0 0 1.805Z",fill:"currentColor"})),dp=u.forwardRef(({children:a,currentlySelected:b=!1,onClick:c,testId:d,...e},f)=>{let g=bc();return u.createElement(be,{as:"button",borderRadius:"menuButton",disabled:b,display:"flex",onClick:c,ref:f,testId:d,type:"button"},u.createElement(be,{borderRadius:"menuButton",className:[g?"v9horb0":void 0,!b&&a4({active:"shrink"})],padding:g?"8":"6",transition:"default",width:"full",...b?{background:"accentColor",borderColor:"selectedOptionBorder",borderStyle:"solid",borderWidth:"1",boxShadow:"selectedOption",color:"accentColorForeground"}:{background:{hover:"menuItemBackground"},color:"modalText",transition:"default"},...e},a))});dp.displayName="MenuButton";var dq=({chainId:a,currentChainId:b,switchChain:c,chainIconSize:d,isLoading:e,src:f,name:g,iconBackground:h,idx:i})=>{let j=bc(),{i18n:k}=(0,u.useContext)(bv),l=b$(),m=b===a;return u.createElement(u.Fragment,null,u.createElement(dp,{currentlySelected:m,onClick:m?void 0:()=>c({chainId:a}),testId:`chain-option-${a}`},u.createElement(be,{fontFamily:"body",fontSize:"16",fontWeight:"bold"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",justifyContent:"space-between"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"4",height:d},f&&u.createElement(be,{height:"full",marginRight:"8"},u.createElement(bk,{alt:g,background:h,borderRadius:"full",height:d,src:f,width:d,testId:`chain-option-${a}-icon`})),u.createElement("div",null,g??g)),m&&u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",marginRight:"6"},u.createElement(cN,{color:"accentColorForeground",size:"14",weight:"medium"},k.t("chains.connected")),u.createElement(be,{background:"connectionIndicator",borderColor:"selectedOptionBorder",borderRadius:"full",borderStyle:"solid",borderWidth:"1",height:"8",marginLeft:"8",width:"8"})),e&&u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",marginRight:"6"},u.createElement(cN,{color:"modalText",size:"14",weight:"medium"},k.t("chains.confirm")),u.createElement(be,{background:"standby",borderRadius:"full",height:"8",marginLeft:"8",width:"8"}))))),j&&i<l.length-1&&u.createElement(be,{background:"generalBorderDim",height:"1",marginX:"8"}))};function dr({onClose:a,open:b}){let{chainId:c}=(0,A.F)(),{chains:d}=(0,D.U)(),[e,f]=(0,u.useState)(null),{switchChain:g}=(0,ap.R)({mutation:{onMutate:({chainId:a})=>{f(a)},onSuccess:()=>{e&&f(null)},onError:()=>{e&&f(null)},onSettled:()=>{a()}}}),{i18n:h}=(0,u.useContext)(bv),{disconnect:i}=(0,L.u)(),j="rk_chain_modal_title",k=bc(),l=d.some(a=>a.id===c),m=k?"36":"28",n=b$();return c?u.createElement(c2,{onClose:a,open:b,titleId:j},u.createElement(c5,{bottomSheetOnMobile:!0,paddingBottom:"0"},u.createElement(be,{display:"flex",flexDirection:"column",gap:"14"},u.createElement(be,{display:"flex",flexDirection:"row",justifyContent:"space-between"},k&&u.createElement(be,{width:"30"}),u.createElement(be,{paddingBottom:"0",paddingLeft:"8",paddingTop:"4"},u.createElement(cN,{as:"h1",color:"modalText",id:j,size:k?"20":"18",weight:"heavy"},h.t("chains.title"))),u.createElement(cR,{onClose:a})),!l&&u.createElement(be,{marginX:"8",textAlign:k?"center":"left"},u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},h.t("chains.wrong_network"))),u.createElement(be,{className:k?"_18dqw9x1":"_18dqw9x0",display:"flex",flexDirection:"column",gap:"4",padding:"2",paddingBottom:"16"},n.map(({iconBackground:a,iconUrl:b,id:d,name:f},h)=>u.createElement(dq,{key:d,chainId:d,currentChainId:c,switchChain:g,chainIconSize:m,isLoading:e===d,src:b,name:f,iconBackground:a,idx:h})),!l&&u.createElement(u.Fragment,null,u.createElement(be,{background:"generalBorderDim",height:"1",marginX:"8"}),u.createElement(dp,{onClick:()=>i(),testId:"chain-option-disconnect"},u.createElement(be,{color:"error",fontFamily:"body",fontSize:"16",fontWeight:"bold"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",justifyContent:"space-between"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"4",height:m},u.createElement(be,{alignItems:"center",color:"error",height:m,justifyContent:"center",marginRight:"8"},u.createElement(dn,{size:Number(m)})),u.createElement("div",null,h.t("chains.disconnect"))))))))))):null}var ds=({children:a,href:b})=>u.createElement(be,{as:"a",color:"accentColor",href:b,rel:"noreferrer",target:"_blank"},a),dt=({children:a})=>u.createElement(cN,{color:"modalTextSecondary",size:"12",weight:"medium"},a);function du({compactModeEnabled:a=!1,getWallet:b}){let{disclaimer:c,learnMoreUrl:d}=(0,u.useContext)(cn),{i18n:e}=(0,u.useContext)(bv);return u.createElement(u.Fragment,null,u.createElement(be,{alignItems:"center",color:"accentColor",display:"flex",flexDirection:"column",height:"full",justifyContent:"space-around"},u.createElement(be,{marginBottom:"10"},!a&&u.createElement(cN,{color:"modalText",size:"18",weight:"heavy"},e.t("intro.title"))),u.createElement(be,{display:"flex",flexDirection:"column",gap:"32",justifyContent:"center",marginY:"20",style:{maxWidth:312}},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16"},u.createElement(be,{borderRadius:"6",height:"48",minWidth:"48",width:"48"},u.createElement(cK,null)),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},e.t("intro.digital_asset.title")),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},e.t("intro.digital_asset.description")))),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16"},u.createElement(be,{borderRadius:"6",height:"48",minWidth:"48",width:"48"},u.createElement(cM,null)),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},e.t("intro.login.title")),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},e.t("intro.login.description"))))),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",margin:"10"},u.createElement(cP,{label:e.t("intro.get.label"),onClick:b}),u.createElement(be,{as:"a",className:a4({active:"shrink",hover:"grow"}),display:"block",href:d,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},u.createElement(cN,{color:"accentColor",size:"14",weight:"bold"},e.t("intro.learn_more.label")))),c&&!a&&u.createElement(be,{marginBottom:"8",marginTop:"12",textAlign:"center"},u.createElement(c,{Link:ds,Text:dt}))))}var dv=()=>u.createElement("svg",{fill:"none",height:"17",viewBox:"0 0 11 17",width:"11",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Back"),u.createElement("path",{d:"M0.99707 8.6543C0.99707 9.08496 1.15527 9.44531 1.51562 9.79688L8.16016 16.3096C8.43262 16.5732 8.74902 16.7051 9.13574 16.7051C9.90918 16.7051 10.5508 16.0811 10.5508 15.3076C10.5508 14.9121 10.3838 14.5605 10.0938 14.2705L4.30176 8.64551L10.0938 3.0293C10.3838 2.74805 10.5508 2.3877 10.5508 2.00098C10.5508 1.23633 9.90918 0.603516 9.13574 0.603516C8.74902 0.603516 8.43262 0.735352 8.16016 0.999023L1.51562 7.51172C1.15527 7.85449 1.00586 8.21484 0.99707 8.6543Z",fill:"currentColor"})),dw=()=>u.createElement("svg",{fill:"none",height:"12",viewBox:"0 0 8 12",width:"8",xmlns:"http://www.w3.org/2000/svg"},u.createElement("title",null,"Info"),u.createElement("path",{d:"M3.64258 7.99609C4.19336 7.99609 4.5625 7.73828 4.68555 7.24609C4.69141 7.21094 4.70312 7.16406 4.70898 7.13477C4.80859 6.60742 5.05469 6.35547 6.04492 5.76367C7.14648 5.10156 7.67969 4.3457 7.67969 3.24414C7.67969 1.39844 6.17383 0.255859 3.95898 0.255859C2.32422 0.255859 1.05859 0.894531 0.548828 1.86719C0.396484 2.14844 0.320312 2.44727 0.320312 2.74023C0.314453 3.37305 0.742188 3.79492 1.42188 3.79492C1.91406 3.79492 2.33594 3.54883 2.53516 3.11523C2.78711 2.47656 3.23242 2.21289 3.83594 2.21289C4.55664 2.21289 5.10742 2.65234 5.10742 3.29102C5.10742 3.9707 4.7793 4.29883 3.81836 4.87891C3.02148 5.36523 2.50586 5.92773 2.50586 6.76562V6.90039C2.50586 7.55664 2.96289 7.99609 3.64258 7.99609ZM3.67188 11.4473C4.42773 11.4473 5.04297 10.8672 5.04297 10.1406C5.04297 9.41406 4.42773 8.83984 3.67188 8.83984C2.91602 8.83984 2.30664 9.41406 2.30664 10.1406C2.30664 10.8672 2.91602 11.4473 3.67188 11.4473Z",fill:"currentColor"})),dx=({"aria-label":a="Info",onClick:b})=>{let c=bc();return u.createElement(be,{alignItems:"center","aria-label":a,as:"button",background:"closeButtonBackground",borderColor:"actionButtonBorder",borderRadius:"full",borderStyle:"solid",borderWidth:c?"0":"1",className:a4({active:"shrinkSm",hover:"growLg"}),color:"closeButton",display:"flex",height:c?"30":"28",justifyContent:"center",onClick:b,style:{willChange:"transform"},transition:"default",type:"button",width:c?"30":"28"},u.createElement(dw,null))},dy=a=>{let b=(0,u.useRef)(null),c=(0,u.useContext)(co),d=bj(a);return(0,u.useEffect)(()=>{if(c&&b.current&&d)return function(a,b){let c;dz++;let d=[15,20,25,35,45],e=[],f=!1,g=0,h=0,i=(()=>{let a="_rk_coolMode",b=document.getElementById(a);if(b)return b;let c=document.createElement("div");return c.setAttribute("id",a),c.setAttribute("style","overflow:hidden;position:fixed;height:100%;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:2147483647"),document.body.appendChild(c),c})();!function a(){for(let a of(f&&e.length<35&&function(){let a=d[Math.floor(Math.random()*d.length)],c=10*Math.random(),f=25*Math.random(),j=360*Math.random(),k=35*Math.random()*(.5>=Math.random()?-1:1),l=h-a/2,m=g-a/2,n=.5>=Math.random()?-1:1,o=document.createElement("div");o.innerHTML=`<img src="${b}" width="${a}" height="${a}" style="border-radius: 25%">`,o.setAttribute("style",`position:absolute;will-change:transform;top:${l}px;left:${m}px;transform:rotate(${j}deg)`),i.appendChild(o),e.push({direction:n,element:o,left:m,size:a,speedHorz:c,speedUp:f,spinSpeed:k,spinVal:j,top:l})}(),e))a.left=a.left-a.speedHorz*a.direction,a.top=a.top-a.speedUp,a.speedUp=Math.min(a.size,a.speedUp-1),a.spinVal=a.spinVal+a.spinSpeed,a.top>=Math.max(window.innerHeight,document.body.clientHeight)+a.size&&(e=e.filter(b=>b!==a),a.element.remove()),a.element.setAttribute("style",`position:absolute;will-change:transform;top:${a.top}px;left:${a.left}px;transform:rotate(${a.spinVal}deg)`);c=requestAnimationFrame(a)}();let j="ontouchstart"in window||navigator.msMaxTouchPoints,k=j?"touchstart":"mousedown",l=j?"touchend":"mouseup",m=j?"touchmove":"mousemove",n=a=>{"touches"in a?(g=a.touches?.[0].clientX,h=a.touches?.[0].clientY):(g=a.clientX,h=a.clientY)},o=a=>{n(a),f=!0},p=()=>{f=!1};return a.addEventListener(m,n,{passive:!1}),a.addEventListener(k,o),a.addEventListener(l,p),a.addEventListener("mouseleave",p),()=>{a.removeEventListener(m,n),a.removeEventListener(k,o),a.removeEventListener(l,p),a.removeEventListener("mouseleave",p);let b=setInterval(()=>{c&&0===e.length&&(cancelAnimationFrame(c),clearInterval(b),0==--dz&&i.remove())},500)}}(b.current,d)},[c,d]),b},dz=0,dA=({as:a="button",currentlySelected:b=!1,iconBackground:c,iconUrl:d,name:e,onClick:f,ready:g,recent:h,testId:i,isRainbowKitConnector:j,...k})=>{let l=dy(d),[m,n]=u.useState(!1),{i18n:o}=u.useContext(bv);return u.createElement(be,{display:"flex",flexDirection:"column",onMouseEnter:()=>n(!0),onMouseLeave:()=>n(!1),ref:l},u.createElement(be,{as:a,borderRadius:"menuButton",borderStyle:"solid",borderWidth:"1",className:b?void 0:["g5kl0l0",a4({active:"shrink"})],disabled:b,onClick:f,padding:"5",style:{willChange:"transform"},testId:i,transition:"default",width:"full",...b?{background:"accentColor",borderColor:"selectedOptionBorder",boxShadow:"selectedWallet"}:{background:{hover:"menuItemBackground"}},...k},u.createElement(be,{color:b?"accentColorForeground":"modalText",disabled:!g,fontFamily:"body",fontSize:"16",fontWeight:"bold",transition:"default"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"12"},u.createElement(bk,{background:c,...!m&&j?{borderColor:"actionButtonBorder"}:{},useAsImage:!j,borderRadius:"6",height:"28",src:d,width:"28"}),u.createElement(be,null,u.createElement(be,{style:{marginTop:h?-2:void 0},maxWidth:"200"},e),h&&u.createElement(cN,{color:b?"accentColorForeground":"accentColor",size:"12",style:{lineHeight:1,marginTop:-1},weight:"medium"},o.t("connect.recent")))))))};dA.displayName="ModalSelection";var dB="rk-latest-id";function dC(a){localStorage.setItem(dB,a)}function dD(){localStorage.removeItem(dB)}var dE=(a,b=1)=>{let c=a.replace("#","");3===c.length&&(c=`${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`);let d=Number.parseInt(c.substring(0,2),16),e=Number.parseInt(c.substring(2,4),16),f=Number.parseInt(c.substring(4,6),16);return b>1&&b<=100&&(b/=100),`rgba(${d},${e},${f},${b})`},dF=a=>/^#([0-9a-f]{3}){1,2}$/i.test(a),dG=async()=>(await c.e(4135).then(c.bind(c,54135))).default,dH=()=>u.createElement(bk,{background:"#515a70",borderColor:"generalBorder",borderRadius:"10",height:"48",src:dG,width:"48"}),dI=async()=>(await c.e(1149).then(c.bind(c,61149))).default,dJ=()=>u.createElement(bk,{background:"#e3a5e8",borderColor:"generalBorder",borderRadius:"10",height:"48",src:dI,width:"48"}),dK=async()=>(await c.e(9409).then(c.bind(c,89409))).default,dL=()=>u.createElement(bk,{background:"#515a70",borderColor:"generalBorder",borderRadius:"10",height:"48",src:dK,width:"48"}),dM=async()=>(await c.e(8749).then(c.bind(c,28749))).default,dN=()=>u.createElement(bk,{background:"#515a70",borderColor:"generalBorder",borderRadius:"10",height:"48",src:dM,width:"48"});function dO({ecc:a="medium",logoBackground:b,logoSize:c=50,logoUrl:d,size:e=200,uri:f}){let g=e-2*Number.parseInt("20",10),h=bj(d);return u.createElement(be,{borderColor:"generalBorder",borderRadius:"menuButton",borderStyle:"solid",borderWidth:"1",className:"_1vwt0cg0",padding:"20",width:"max"},u.createElement(be,{style:{height:g,userSelect:"none",width:g},userSelect:"none"},u.createElement(aJ.Root,{errorCorrection:a,size:g,value:f},u.createElement(aJ.Cells,{radius:1}),u.createElement(aJ.Finder,{radius:.25}),h&&u.createElement(aJ.Arena,null,u.createElement("img",{alt:"Wallet Logo",src:h,style:{objectFit:"cover",height:"88%",width:"88%",borderRadius:"22.5%",backgroundColor:b}})))))}var dP=async()=>{switch(cx()){case"Arc":return(await c.e(5141).then(c.bind(c,95141))).default;case"Brave":return(await c.e(9127).then(c.bind(c,69127))).default;case"Chrome":return(await c.e(7707).then(c.bind(c,77707))).default;case"Edge":return(await c.e(1814).then(c.bind(c,41814))).default;case"Firefox":return(await c.e(7346).then(c.bind(c,67346))).default;case"Opera":return(await c.e(894).then(c.bind(c,60894))).default;case"Safari":return(await c.e(4069).then(c.bind(c,34069))).default;default:return(await c.e(7702).then(c.bind(c,47702))).default}},dQ=async()=>{switch(cz()){case"Windows":return(await c.e(6963).then(c.bind(c,86963))).default;case"macOS":return(await c.e(3100).then(c.bind(c,33100))).default;default:return(await c.e(3035).then(c.bind(c,23035))).default}};function dR({getWalletDownload:a,compactModeEnabled:b}){let c=cI().filter(a=>a.isRainbowKitConnector).splice(0,5),{i18n:d}=(0,u.useContext)(bv);return u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",marginTop:"18",width:"full"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"28",height:"full",width:"full"},c?.filter(a=>a.extensionDownloadUrl||a.desktopDownloadUrl||a.qrCode&&a.downloadUrls?.qrCode).map(b=>{let{downloadUrls:c,iconBackground:e,iconUrl:f,id:g,name:h,qrCode:i}=b,j=c?.qrCode&&i,k=!!b.extensionDownloadUrl,l=c?.qrCode&&k,m=c?.qrCode&&!!b.desktopDownloadUrl;return u.createElement(be,{alignItems:"center",display:"flex",gap:"16",justifyContent:"space-between",key:b.id,width:"full"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16"},u.createElement(bk,{background:e,borderColor:"actionButtonBorder",borderRadius:"10",height:"48",src:f,width:"48"}),u.createElement(be,{display:"flex",flexDirection:"column",gap:"2"},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},h),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},l?d.t("get.mobile_and_extension.description"):m?d.t("get.mobile_and_desktop.description"):j?d.t("get.mobile.description"):k?d.t("get.extension.description"):null))),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},u.createElement(cP,{label:d.t("get.action.label"),onClick:()=>a(g),type:"secondary"})))})),u.createElement(be,{alignItems:"center",borderRadius:"10",display:"flex",flexDirection:"column",gap:"8",justifyContent:"space-between",marginBottom:"4",paddingY:"8",style:{maxWidth:275,textAlign:"center"}},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},d.t("get.looking_for.title")),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},b?d.t("get.looking_for.desktop.compact_description"):d.t("get.looking_for.desktop.wide_description"))))}function dS({changeWalletStep:a,compactModeEnabled:b,connectionError:c,onClose:d,qrCodeUri:e,reconnect:f,wallet:g}){let{downloadUrls:h,iconBackground:i,iconUrl:j,name:k,qrCode:l,ready:m,showWalletConnectModal:n,getDesktopUri:o}=g,p=!!o,q=cw(),{i18n:r}=(0,u.useContext)(bv),s=!!g.extensionDownloadUrl,t=h?.qrCode&&s,v=h?.qrCode&&!!g.desktopDownloadUrl,w=l&&e,x=async()=>{let a=await o?.();window.open(a,q?"_blank":"_self")},y=n?{description:b?r.t("connect.walletconnect.description.compact"):r.t("connect.walletconnect.description.full"),label:r.t("connect.walletconnect.open.label"),onClick:()=>{d(),n()}}:w?{description:r.t("connect.secondary_action.get.description",{wallet:k}),label:r.t("connect.secondary_action.get.label"),onClick:()=>a(t||v?"DOWNLOAD_OPTIONS":"DOWNLOAD")}:null,{width:z}=cp();return u.createElement(be,{display:"flex",flexDirection:"column",height:"full",width:"full"},w?u.createElement(be,{alignItems:"center",display:"flex",height:"full",justifyContent:"center"},u.createElement(dO,{logoBackground:i,logoSize:b?60:72,logoUrl:j,size:b?318:z&&z<768?Math.max(280,Math.min(z-308,382)):382,uri:e})):u.createElement(be,{alignItems:"center",display:"flex",justifyContent:"center",style:{flexGrow:1}},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"8"},u.createElement(be,{borderRadius:"10",height:"44",overflow:"hidden"},u.createElement(bk,{useAsImage:!g.isRainbowKitConnector,height:"44",src:j,width:"44"})),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"4",paddingX:"32",style:{textAlign:"center"}},u.createElement(cN,{color:"modalText",size:"18",weight:"bold"},m?r.t("connect.status.opening",{wallet:k}):s?r.t("connect.status.not_installed",{wallet:k}):r.t("connect.status.not_available",{wallet:k})),!m&&s?u.createElement(be,{paddingTop:"20"},u.createElement(cP,{href:g.extensionDownloadUrl,label:r.t("connect.secondary_action.install.label"),type:"secondary"})):null,m&&!w&&u.createElement(u.Fragment,null,u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",justifyContent:"center"},u.createElement(cN,{color:"modalTextSecondary",size:"14",textAlign:"center",weight:"medium"},r.t("connect.status.confirm"))),u.createElement(be,{alignItems:"center",color:"modalText",display:"flex",flexDirection:"row",height:"32",marginTop:"8"},c?u.createElement(cP,{label:r.t("connect.secondary_action.retry.label"),onClick:async()=>{p&&x(),f(g)}}):u.createElement(be,{color:"modalTextSecondary"},u.createElement(bl,null))))))),u.createElement(be,{alignItems:"center",borderRadius:"10",display:"flex",flexDirection:"row",gap:"8",height:"28",justifyContent:"space-between",marginTop:"12"},m&&y&&u.createElement(u.Fragment,null,u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},y.description),u.createElement(cP,{label:y.label,onClick:y.onClick,type:"secondary"}))))}var dT=({actionLabel:a,description:b,iconAccent:c,iconBackground:d,iconUrl:e,isCompact:f,onAction:g,title:h,url:i,variant:j})=>{let k="browser"===j,l=!k&&c&&(a=>a?[dE(a,.2),dE(a,.14),dE(a,.1)]:null)(c);return u.createElement(be,{alignItems:"center",borderRadius:"13",display:"flex",justifyContent:"center",overflow:"hidden",paddingX:f?"18":"44",position:"relative",style:{flex:1,isolation:"isolate"},width:"full"},u.createElement(be,{borderColor:"actionButtonBorder",borderRadius:"13",borderStyle:"solid",borderWidth:"1",style:{bottom:"0",left:"0",position:"absolute",right:"0",top:"0",zIndex:1}}),k&&u.createElement(be,{background:"downloadTopCardBackground",height:"full",position:"absolute",style:{zIndex:0},width:"full"},u.createElement(be,{display:"flex",flexDirection:"row",justifyContent:"space-between",style:{bottom:"0",filter:"blur(20px)",left:"0",position:"absolute",right:"0",top:"0",transform:"translate3d(0, 0, 0)"}},u.createElement(be,{style:{filter:"blur(100px)",marginLeft:-27,marginTop:-20,opacity:.6,transform:"translate3d(0, 0, 0)"}},u.createElement(bk,{borderRadius:"full",height:"200",src:e,width:"200"})),u.createElement(be,{style:{filter:"blur(100px)",marginRight:0,marginTop:105,opacity:.6,overflow:"auto",transform:"translate3d(0, 0, 0)"}},u.createElement(bk,{borderRadius:"full",height:"200",src:e,width:"200"})))),!k&&l&&u.createElement(be,{background:"downloadBottomCardBackground",style:{bottom:"0",left:"0",position:"absolute",right:"0",top:"0"}},u.createElement(be,{position:"absolute",style:{background:`radial-gradient(50% 50% at 50% 50%, ${l[0]} 0%, ${l[1]} 25%, rgba(0,0,0,0) 100%)`,height:564,left:-215,top:-197,transform:"translate3d(0, 0, 0)",width:564}}),u.createElement(be,{position:"absolute",style:{background:`radial-gradient(50% 50% at 50% 50%, ${l[2]} 0%, rgba(0, 0, 0, 0) 100%)`,height:564,left:-1,top:-76,transform:"translate3d(0, 0, 0)",width:564}})),u.createElement(be,{alignItems:"flex-start",display:"flex",flexDirection:"row",gap:"24",height:"max",justifyContent:"center",style:{zIndex:1}},u.createElement(be,null,u.createElement(bk,{height:"60",src:e,width:"60",...d?{background:d,borderColor:"generalBorder",borderRadius:"10"}:null})),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4",style:{flex:1},width:"full"},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},h),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},b),u.createElement(be,{marginTop:"14",width:"max"},u.createElement(cP,{href:i,label:a,onClick:g,size:"medium"})))))};function dU({changeWalletStep:a,wallet:b}){let c=cx(),d=cz(),e="compact"===(0,u.useContext)(ct),{desktop:f,desktopDownloadUrl:g,extension:h,extensionDownloadUrl:i,mobileDownloadUrl:j}=b,{i18n:k}=(0,u.useContext)(bv);return u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"24",height:"full",marginBottom:"8",marginTop:"4",width:"full"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"8",height:"full",justifyContent:"center",width:"full"},i&&u.createElement(dT,{actionLabel:k.t("get_options.extension.download.label",{browser:c}),description:k.t("get_options.extension.description"),iconUrl:dP,isCompact:e,onAction:()=>a(h?.instructions?"INSTRUCTIONS_EXTENSION":"CONNECT"),title:k.t("get_options.extension.title",{wallet:b.name,browser:c}),url:i,variant:"browser"}),g&&u.createElement(dT,{actionLabel:k.t("get_options.desktop.download.label",{platform:d}),description:k.t("get_options.desktop.description"),iconUrl:dQ,isCompact:e,onAction:()=>a(f?.instructions?"INSTRUCTIONS_DESKTOP":"CONNECT"),title:k.t("get_options.desktop.title",{wallet:b.name,platform:d}),url:g,variant:"desktop"}),j&&u.createElement(dT,{actionLabel:k.t("get_options.mobile.download.label",{wallet:b.name}),description:k.t("get_options.mobile.description"),iconAccent:b.iconAccent,iconBackground:b.iconBackground,iconUrl:b.iconUrl,isCompact:e,onAction:()=>{a("DOWNLOAD")},title:k.t("get_options.mobile.title",{wallet:b.name}),variant:"app"})))}function dV({changeWalletStep:a,wallet:b}){let{downloadUrls:c,qrCode:d}=b,{i18n:e}=(0,u.useContext)(bv);return u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"24",height:"full",width:"full"},u.createElement(be,{style:{maxWidth:220,textAlign:"center"}},u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"semibold"},e.t("get_mobile.description"))),u.createElement(be,{height:"full"},c?.qrCode?u.createElement(dO,{logoSize:0,size:268,uri:c.qrCode}):null),u.createElement(be,{alignItems:"center",borderRadius:"10",display:"flex",flexDirection:"row",gap:"8",height:"34",justifyContent:"space-between",marginBottom:"12",paddingY:"8"},u.createElement(cP,{label:e.t("get_mobile.continue.label"),onClick:()=>a(d?.instructions?"INSTRUCTIONS_MOBILE":"CONNECT")})))}var dW={connect:()=>u.createElement(dH,null),create:()=>u.createElement(dJ,null),install:a=>u.createElement(bk,{background:a.iconBackground,borderColor:"generalBorder",borderRadius:"10",height:"48",src:a.iconUrl,width:"48"}),refresh:()=>u.createElement(dL,null),scan:()=>u.createElement(dN,null)};function dX({connectWallet:a,wallet:b}){let{i18n:c}=(0,u.useContext)(bv);return u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",width:"full"},u.createElement(be,{display:"flex",flexDirection:"column",gap:"28",height:"full",justifyContent:"center",paddingY:"32",style:{maxWidth:320}},b?.qrCode?.instructions?.steps.map((a,d)=>u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16",key:d},u.createElement(be,{borderRadius:"10",height:"48",minWidth:"48",overflow:"hidden",position:"relative",width:"48"},dW[a.step]?.(b)),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},c.t(a.title,void 0,{rawKeyIfTranslationMissing:!0})),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},c.t(a.description,void 0,{rawKeyIfTranslationMissing:!0})))))),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",marginBottom:"16"},u.createElement(cP,{label:c.t("get_instructions.mobile.connect.label"),onClick:()=>a(b)}),u.createElement(be,{as:"a",className:a4({active:"shrink",hover:"grow"}),display:"block",href:b?.qrCode?.instructions?.learnMoreUrl,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},u.createElement(cN,{color:"accentColor",size:"14",weight:"bold"},c.t("get_instructions.mobile.learn_more.label")))))}function dY({wallet:a}){let{i18n:b}=(0,u.useContext)(bv);return u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",width:"full"},u.createElement(be,{display:"flex",flexDirection:"column",gap:"28",height:"full",justifyContent:"center",paddingY:"32",style:{maxWidth:320}},a?.extension?.instructions?.steps.map((c,d)=>u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16",key:d},u.createElement(be,{borderRadius:"10",height:"48",minWidth:"48",overflow:"hidden",position:"relative",width:"48"},dW[c.step]?.(a)),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},b.t(c.title,void 0,{rawKeyIfTranslationMissing:!0})),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},b.t(c.description,void 0,{rawKeyIfTranslationMissing:!0})))))),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",marginBottom:"16"},u.createElement(cP,{label:b.t("get_instructions.extension.refresh.label"),onClick:window.location.reload.bind(window.location)}),u.createElement(be,{as:"a",className:a4({active:"shrink",hover:"grow"}),display:"block",href:a?.extension?.instructions?.learnMoreUrl,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},u.createElement(cN,{color:"accentColor",size:"14",weight:"bold"},b.t("get_instructions.extension.learn_more.label")))))}function dZ({connectWallet:a,wallet:b}){let{i18n:c}=(0,u.useContext)(bv);return u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",width:"full"},u.createElement(be,{display:"flex",flexDirection:"column",gap:"28",height:"full",justifyContent:"center",paddingY:"32",style:{maxWidth:320}},b?.desktop?.instructions?.steps.map((a,d)=>u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16",key:d},u.createElement(be,{borderRadius:"10",height:"48",minWidth:"48",overflow:"hidden",position:"relative",width:"48"},dW[a.step]?.(b)),u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},u.createElement(cN,{color:"modalText",size:"14",weight:"bold"},c.t(a.title,void 0,{rawKeyIfTranslationMissing:!0})),u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},c.t(a.description,void 0,{rawKeyIfTranslationMissing:!0})))))),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",marginBottom:"16"},u.createElement(cP,{label:c.t("get_instructions.desktop.connect.label"),onClick:()=>a(b)}),u.createElement(be,{as:"a",className:a4({active:"shrink",hover:"grow"}),display:"block",href:b?.desktop?.instructions?.learnMoreUrl,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},u.createElement(cN,{color:"accentColor",size:"14",weight:"bold"},c.t("get_instructions.desktop.learn_more.label")))))}function d$({onClose:a}){let b,[c,d]=(0,u.useState)(),[e,f]=(0,u.useState)(),[g,h]=(0,u.useState)(),i=!!e?.qrCode&&g,[j,k]=(0,u.useState)(!1),l=(0,u.useContext)(ct)===cs.COMPACT,{disclaimer:m}=(0,u.useContext)(cn),{i18n:n}=(0,u.useContext)(bv),o=cw(),p=(0,u.useRef)(!1),{connector:q}=(0,u.useContext)(cq),r=cI(!q).filter(a=>a.ready||!!a.extensionDownloadUrl).sort((a,b)=>a.groupIndex-b.groupIndex),s=cI(),t=function(a,b){let c={};for(let d of a){let a=b(d);a&&(c[a]||(c[a]=[]),c[a].push(d))}return c}(r,a=>a.groupName),v=["Recommended","Other","Popular","More","Others","Installed"];(0,u.useEffect)(()=>{q&&!p.current&&(B("CONNECT"),z(q),p.current=!0)},[q]);let w=a=>{k(!1),a.ready&&a?.connect?.()?.catch(()=>{k(!0)})},x=async a=>{let b=r.find(b=>a.id===b.id);b?.getDesktopUri&&setTimeout(async()=>{let a=await b?.getDesktopUri?.();a&&window.open(a,o?"_blank":"_self")},0)},y=async a=>{let b=r.find(b=>a.id===b.id),c=await b?.getQrCodeUri?.();h(c),setTimeout(()=>{f(b),B("CONNECT")},50*!c)},z=async a=>{dC(a.id),a.ready&&(y(a),x(a)),w(a),d(a.id),a.ready||(f(a),B(a?.extensionDownloadUrl?"DOWNLOAD_OPTIONS":"CONNECT"))},A=()=>{d(void 0),f(void 0),h(void 0)},B=(a,b=!1)=>{b&&"GET"===a&&"GET"===C?A():b||"GET"!==a?b||"CONNECT"!==a||D("CONNECT"):D("GET"),F(a)},[C,D]=(0,u.useState)("NONE"),[E,F]=(0,u.useState)("NONE"),G=null,H=null,I=null;(0,u.useEffect)(()=>{k(!1)},[E,e]);let J=!!(e?.extensionDownloadUrl&&e?.mobileDownloadUrl);switch(E){case"NONE":G=u.createElement(du,{getWallet:()=>B("GET")});break;case"LEARN_COMPACT":G=u.createElement(du,{compactModeEnabled:l,getWallet:()=>B("GET")}),H=n.t("intro.title"),I="NONE";break;case"GET":G=u.createElement(dR,{getWalletDownload:a=>{let b=s.find(b=>a===b.id),c=b?.downloadUrls?.qrCode,d=!!b?.desktopDownloadUrl,e=!!b?.extensionDownloadUrl;f(b),c&&(e||d)?B("DOWNLOAD_OPTIONS"):c?B("DOWNLOAD"):d?B("INSTRUCTIONS_DESKTOP"):B("INSTRUCTIONS_EXTENSION")},compactModeEnabled:l}),H=n.t("get.title"),I=l?"LEARN_COMPACT":"NONE";break;case"CONNECT":G=e&&u.createElement(dS,{changeWalletStep:B,compactModeEnabled:l,connectionError:j,onClose:a,qrCodeUri:g,reconnect:w,wallet:e}),H=i&&("WalletConnect"===e.name?n.t("connect_scan.fallback_title"):n.t("connect_scan.title",{wallet:e.name})),I=l?q?null:"NONE":null,b=l?q?()=>{}:A:()=>{};break;case"DOWNLOAD_OPTIONS":G=e&&u.createElement(dU,{changeWalletStep:B,wallet:e}),H=e&&n.t("get_options.short_title",{wallet:e.name}),I=q?"CONNECT":l?"NONE":C;break;case"DOWNLOAD":G=e&&u.createElement(dV,{changeWalletStep:B,wallet:e}),H=e&&n.t("get_mobile.title",{wallet:e.name}),I=J?"DOWNLOAD_OPTIONS":C;break;case"INSTRUCTIONS_MOBILE":G=e&&u.createElement(dX,{connectWallet:z,wallet:e}),H=e&&n.t("get_options.title",{wallet:l&&e.shortName||e.name}),I="DOWNLOAD";break;case"INSTRUCTIONS_EXTENSION":G=e&&u.createElement(dY,{wallet:e}),H=e&&n.t("get_options.title",{wallet:l&&e.shortName||e.name}),I="DOWNLOAD_OPTIONS";break;case"INSTRUCTIONS_DESKTOP":G=e&&u.createElement(dZ,{connectWallet:z,wallet:e}),H=e&&n.t("get_options.title",{wallet:l&&e.shortName||e.name}),I="DOWNLOAD_OPTIONS"}return u.createElement(be,{display:"flex",flexDirection:"row",style:{maxHeight:l?468:504}},(!l||"NONE"===E)&&u.createElement(be,{className:l?"_1vwt0cg4":"_1vwt0cg3",display:"flex",flexDirection:"column",marginTop:"16"},u.createElement(be,{display:"flex",justifyContent:"space-between"},l&&m&&u.createElement(be,{marginLeft:"16",width:"28"},u.createElement(dx,{onClick:()=>B("LEARN_COMPACT")})),l&&!m&&u.createElement(be,{marginLeft:"16",width:"28"}),u.createElement(be,{marginLeft:l?"0":"6",paddingBottom:"8",paddingTop:"2",paddingX:"18"},u.createElement(cN,{as:"h1",color:"modalText",id:"rk_connect_title",size:"18",weight:"heavy",testId:"connect-header-label"},n.t("connect.title"))),l&&u.createElement(be,{marginRight:"16"},u.createElement(cR,{onClose:a}))),u.createElement(be,{className:"_1vwt0cg2 ju367v7a ju367v7v",paddingBottom:"18"},Object.entries(t).map(([a,b],d)=>b.length>0&&u.createElement(u.Fragment,{key:d},a?u.createElement(be,{marginBottom:"8",marginTop:"16",marginX:"6"},u.createElement(cN,{color:"Installed"===a?"accentColor":"modalTextSecondary",size:"14",weight:"bold"},v.includes(a)?n.t(`connector_group.${a.toLowerCase()}`):a)):null,u.createElement(be,{display:"flex",flexDirection:"column",gap:"4"},b.map(a=>u.createElement(dA,{currentlySelected:a.id===c,iconBackground:a.iconBackground,iconUrl:a.iconUrl,key:a.id,name:a.name,onClick:()=>z(a),ready:a.ready,recent:a.recent,testId:`wallet-option-${a.id}`,isRainbowKitConnector:a.isRainbowKitConnector})))))),l&&u.createElement(u.Fragment,null,u.createElement(be,{background:"generalBorder",height:"1",marginTop:"-1"}),m?u.createElement(be,{paddingX:"24",paddingY:"16",textAlign:"center"},u.createElement(m,{Link:ds,Text:dt})):u.createElement(be,{alignItems:"center",display:"flex",justifyContent:"space-between",paddingX:"24",paddingY:"16"},u.createElement(be,{paddingY:"4"},u.createElement(cN,{color:"modalTextSecondary",size:"14",weight:"medium"},n.t("connect.new_to_ethereum.description"))),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"4",justifyContent:"center"},u.createElement(be,{className:a4({active:"shrink",hover:"grow"}),cursor:"pointer",onClick:()=>B("LEARN_COMPACT"),paddingY:"4",style:{willChange:"transform"},transition:"default"},u.createElement(cN,{color:"accentColor",size:"14",weight:"bold"},n.t("connect.new_to_ethereum.learn_more.label"))))))),(!l||"NONE"!==E)&&u.createElement(u.Fragment,null,!l&&u.createElement(be,{background:"generalBorder",minWidth:"1",width:"1"}),u.createElement(be,{display:"flex",flexDirection:"column",margin:"16",style:{flexGrow:1}},u.createElement(be,{alignItems:"center",display:"flex",justifyContent:"space-between",marginBottom:"12"},u.createElement(be,{width:"28"},I&&u.createElement(be,{as:"button",className:a4({active:"shrinkSm",hover:"growLg"}),color:"accentColor",onClick:()=>{I&&B(I,!0),b?.()},paddingX:"8",paddingY:"4",style:{boxSizing:"content-box",height:17,willChange:"transform"},transition:"default",type:"button"},u.createElement(dv,null))),u.createElement(be,{display:"flex",justifyContent:"center",style:{flexGrow:1}},H&&u.createElement(cN,{color:"modalText",size:"18",textAlign:"center",weight:"heavy"},H)),u.createElement(cR,{onClose:a})),u.createElement(be,{display:"flex",flexDirection:"column",style:{minHeight:l?396:432}},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"6",height:"full",justifyContent:"center",marginX:"8"},G)))))}var d_=({wallet:a})=>u.createElement("svg",{className:"_1am14413",viewBox:"0 0 86 86",width:"86",height:"86"},u.createElement("title",null,"Loading"),u.createElement("rect",{x:"3",y:"3",width:80,height:80,rx:20,ry:20,strokeDasharray:`${53.333333333333336} ${320/3}`,strokeDashoffset:160,className:"_1am14412",style:{stroke:a?.iconAccent||"#0D3887"}}));function d0({onClose:a,wallet:b,connecting:c}){let{connect:d,iconBackground:e,iconUrl:f,id:g,name:h,getMobileUri:i,ready:j,shortName:k,showWalletConnectModal:l}=b,m=dy(f);(0,u.useRef)(!1);let{i18n:n}=(0,u.useContext)(bv),o=(0,u.useCallback)(async()=>{let b=async()=>{let a=await i?.();if(a)if(a&&function({mobileUri:a,name:b}){localStorage.setItem(cU,JSON.stringify({href:a.split("?")[0],name:b}))}({mobileUri:a,name:h}),a.startsWith("http")){let b=document.createElement("a");b.href=a,b.target="_blank",b.rel="noreferrer noopener",b.click()}else window.location.href=a};if("walletConnect"!==g&&b(),l){l(),a?.();return}try{await d?.()}catch{}},[d,i,l,a,h,g]);return u.createElement(be,{as:"button",color:j?"modalText":"modalTextSecondary",disabled:!j,fontFamily:"body",key:g,onClick:o,ref:m,style:{overflow:"visible",textAlign:"center"},testId:`wallet-option-${g}`,type:"button",width:"full"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",justifyContent:"center"},u.createElement(be,{display:"flex",alignItems:"center",justifyContent:"center",paddingBottom:"8",paddingTop:"10",position:"relative"},c?u.createElement(d_,{wallet:b}):null,u.createElement(bk,{background:e,borderRadius:"13",boxShadow:"walletLogo",height:"60",src:f,width:"60"})),c?null:u.createElement(be,{display:"flex",flexDirection:"column",textAlign:"center"},u.createElement(cN,{as:"h2",color:b.ready?"modalText":"modalTextSecondary",size:"13",weight:"medium"},u.createElement(be,{as:"span",position:"relative"},k??h,!b.ready&&" (unsupported)")),b.recent&&u.createElement(cN,{color:"accentColor",size:"12",weight:"medium"},n.t("connect.recent")))))}function d1({onClose:a}){let b=cI().filter(a=>a.isRainbowKitConnector),{disclaimer:c,learnMoreUrl:d}=(0,u.useContext)(cn),e=null,f=null,g=!1,h=null,[i,j]=(0,u.useState)("CONNECT"),{i18n:k}=(0,u.useContext)(bv),l=bb();switch(i){case"CONNECT":e=k.t("connect.title"),g=!0,f=u.createElement(be,null,u.createElement(be,{background:"profileForeground",className:"_1am14410",display:"flex",paddingBottom:"20",paddingTop:"6"},u.createElement(be,{display:"flex",style:{margin:"0 auto"}},b.filter(a=>a.ready).map(b=>u.createElement(be,{key:b.id,paddingX:"20"},u.createElement(be,{width:"60"},u.createElement(d0,{onClose:a,wallet:b})))))),u.createElement(be,{background:"generalBorder",height:"1",marginBottom:"32",marginTop:"-1"}),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"32",paddingX:"32",style:{textAlign:"center"}},u.createElement(be,{display:"flex",flexDirection:"column",gap:"8",textAlign:"center"},u.createElement(cN,{color:"modalText",size:"16",weight:"bold"},k.t("intro.title")),u.createElement(cN,{color:"modalTextSecondary",size:"16"},k.t("intro.description")))),u.createElement(be,{paddingTop:"32",paddingX:"20"},u.createElement(be,{display:"flex",gap:"14",justifyContent:"center"},u.createElement(cP,{label:k.t("intro.get.label"),onClick:()=>j("GET"),size:"large",type:"secondary"}),u.createElement(cP,{href:d,label:k.t("intro.learn_more.label"),size:"large",type:"secondary"}))),c&&u.createElement(be,{marginTop:"28",marginX:"32",textAlign:"center"},u.createElement(c,{Link:ds,Text:dt})));break;case"GET":{e=k.t("get.title"),h="CONNECT";let a=b?.filter(a=>a.downloadUrls?.ios||a.downloadUrls?.android||a.downloadUrls?.mobile)?.splice(0,3);f=u.createElement(be,null,u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",marginBottom:"36",marginTop:"5",paddingTop:"12",width:"full"},a.map((b,c)=>{let{downloadUrls:d,iconBackground:e,iconUrl:f,name:g}=b;return d?.ios||d?.android||d?.mobile?u.createElement(be,{display:"flex",gap:"16",key:b.id,paddingX:"20",width:"full"},u.createElement(be,{style:{minHeight:48,minWidth:48}},u.createElement(bk,{background:e,borderColor:"generalBorder",borderRadius:"10",height:"48",src:f,width:"48"})),u.createElement(be,{display:"flex",flexDirection:"column",width:"full"},u.createElement(be,{alignItems:"center",display:"flex",height:"48"},u.createElement(be,{width:"full"},u.createElement(cN,{color:"modalText",size:"18",weight:"bold"},g)),u.createElement(cP,{href:(l?d?.ios:d?.android)||d?.mobile,label:k.t("get.action.label"),size:"small",type:"secondary"})),c<a.length-1&&u.createElement(be,{background:"generalBorderDim",height:"1",marginY:"10",width:"full"}))):null})),u.createElement(be,{style:{marginBottom:"42px"}}),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",gap:"36",paddingX:"36",style:{textAlign:"center"}},u.createElement(be,{display:"flex",flexDirection:"column",gap:"12",textAlign:"center"},u.createElement(cN,{color:"modalText",size:"16",weight:"bold"},k.t("get.looking_for.title")),u.createElement(cN,{color:"modalTextSecondary",size:"16"},k.t("get.looking_for.mobile.description")))))}}return u.createElement(be,{display:"flex",flexDirection:"column",paddingBottom:"36"},u.createElement(be,{background:g?"profileForeground":"modalBackground",display:"flex",flexDirection:"column",paddingBottom:"4",paddingTop:"14"},u.createElement(be,{display:"flex",justifyContent:"center",paddingBottom:"6",paddingX:"20",position:"relative"},h&&u.createElement(be,{display:"flex",position:"absolute",style:{left:0,marginBottom:-20,marginTop:-20}},u.createElement(be,{alignItems:"center",as:"button",className:a4({active:"shrinkSm",hover:"growLg"}),color:"accentColor",display:"flex",marginLeft:"4",marginTop:"20",onClick:()=>j(h),padding:"16",style:{height:17,willChange:"transform"},transition:"default",type:"button"},u.createElement(dv,null))),u.createElement(be,{marginTop:"4",textAlign:"center",width:"full"},u.createElement(cN,{as:"h1",color:"modalText",id:"rk_connect_title",size:"20",weight:"bold"},e)),u.createElement(be,{alignItems:"center",display:"flex",height:"32",paddingRight:"14",position:"absolute",right:"0"},u.createElement(be,{style:{marginBottom:-20,marginTop:-20}},u.createElement(cR,{onClose:a}))))),u.createElement(be,{display:"flex",flexDirection:"column"},f))}var d2=({onClose:a})=>{let{connector:b}=(0,u.useContext)(cq),{i18n:c}=(0,u.useContext)(bv),d=b?.name||"";return u.createElement(be,null,u.createElement(be,{display:"flex",paddingBottom:"32",justifyContent:"center",alignItems:"center",background:"profileForeground",flexDirection:"column"},u.createElement(be,{width:"full",display:"flex",justifyContent:"flex-end",marginTop:"18",marginRight:"24"},u.createElement(cR,{onClose:a})),u.createElement(be,{width:"60"},u.createElement(d0,{onClose:a,wallet:b,connecting:!0})),u.createElement(be,{marginTop:"20"},u.createElement(cN,{textAlign:"center",color:"modalText",size:"18",weight:"semibold"},c.t("connect.status.connect_mobile",{wallet:d}))),u.createElement(be,{maxWidth:"full",marginTop:"8"},u.createElement(cN,{textAlign:"center",color:"modalText",size:"16",weight:"medium"},c.t("connect.status.confirm_mobile",{wallet:d})))))};function d3({onClose:a}){let{connector:b}=(0,u.useContext)(cq);return bc()?b?u.createElement(d2,{onClose:a}):u.createElement(d1,{onClose:a}):u.createElement(d$,{onClose:a})}function d4({onClose:a,open:b}){let c="rk_connect_title",d=a9(),{disconnect:e}=(0,L.u)(),{isConnecting:f}=(0,A.F)(),g=u.useCallback(()=>{a(),e()},[a,e]),h=u.useCallback(()=>{f&&e(),a()},[a,e,f]);return"disconnected"===d?u.createElement(c2,{onClose:h,open:b,titleId:c},u.createElement(c5,{bottomSheetOnMobile:!0,padding:"0",wide:!0},u.createElement(d3,{onClose:h}))):"unauthenticated"===d?u.createElement(c2,{onClose:g,open:b,titleId:c},u.createElement(c5,{bottomSheetOnMobile:!0,padding:"0"},u.createElement(cT,{onClose:g,onCloseModal:a}))):null}function d5(){let[a,b]=(0,u.useState)(!1);return{closeModal:(0,u.useCallback)(()=>b(!1),[]),isModalOpen:a,openModal:(0,u.useCallback)(()=>b(!0),[])}}var d6=(0,u.createContext)({accountModalOpen:!1,chainModalOpen:!1,connectModalOpen:!1,isWalletConnectModalOpen:!1,setIsWalletConnectModalOpen:()=>{}});function d7({children:a}){let{closeModal:b,isModalOpen:c,openModal:d}=d5(),{closeModal:e,isModalOpen:f,openModal:g}=d5(),{closeModal:h,isModalOpen:i,openModal:j}=d5(),[k,l]=(0,u.useState)(!1),m=a9(),{chainId:n}=(0,A.F)(),{chains:o}=(0,D.U)(),p=o.some(a=>a.id===n),q=(0,u.useCallback)(({keepConnectModalOpen:a=!1}={})=>{a||b(),e(),h()},[b,e,h]),r="unauthenticated"===a8();return(0,B.U)({onConnect:()=>q({keepConnectModalOpen:r}),onDisconnect:()=>q()}),(0,u.useEffect)(()=>{r&&q()},[r,q]),u.createElement(d6.Provider,{value:(0,u.useMemo)(()=>({accountModalOpen:f,chainModalOpen:i,connectModalOpen:c,isWalletConnectModalOpen:k,openAccountModal:p&&"connected"===m?g:void 0,openChainModal:"connected"===m?j:void 0,openConnectModal:"disconnected"===m||"unauthenticated"===m?d:void 0,setIsWalletConnectModalOpen:l}),[m,f,i,c,g,j,d,p,k])},a,u.createElement(d4,{onClose:b,open:c}),u.createElement(dm,{onClose:e,open:f}),u.createElement(dr,{onClose:h,open:i}))}function d8(){let{accountModalOpen:a,chainModalOpen:b,connectModalOpen:c}=(0,u.useContext)(d6);return{accountModalOpen:a,chainModalOpen:b,connectModalOpen:c}}function d9(){let{accountModalOpen:a,openAccountModal:b}=(0,u.useContext)(d6);return{accountModalOpen:a,openAccountModal:b}}function ea(){let{chainModalOpen:a,openChainModal:b}=(0,u.useContext)(d6);return{chainModalOpen:a,openChainModal:b}}function eb(){let{isWalletConnectModalOpen:a,setIsWalletConnectModalOpen:b}=(0,u.useContext)(d6);return{isWalletConnectModalOpen:a,setIsWalletConnectModalOpen:b}}function ec(){let{connectModalOpen:a,openConnectModal:b}=(0,u.useContext)(d6),{isWalletConnectModalOpen:c}=eb();return{connectModalOpen:a||c,openConnectModal:b}}var ed=()=>{};function ee({children:a}){let b=b2(),{address:c}=(0,A.F)(),{chainId:d}=(0,A.F)(),{chains:e}=(0,D.U)(),f=e.some(a=>a.id===d),g=(()=>{let a=b$();return(0,u.useMemo)(()=>{let b={};for(let c of a)b[c.id]=c;return b},[a])})(),h=a8()??void 0,i=d?g[d]:void 0,j=i?.name??void 0,k=i?.iconUrl??void 0,l=i?.iconBackground??void 0,m=bj(k),n=(0,u.useContext)(cv),o=ci().some(({status:a})=>"pending"===a)&&n,{showBalance:p}=b1(),{balance:q,ensAvatar:r,ensName:s}=ca({address:c,includeBalance:"boolean"==typeof p?p:!p||a_(p)[bc()?"smallScreen":"largeScreen"]}),t=q?`${c8(Number.parseFloat(q.formatted))} ${q.symbol}`:void 0,{openConnectModal:v}=ec(),{openChainModal:w}=ea(),{openAccountModal:x}=d9(),{accountModalOpen:y,chainModalOpen:z,connectModalOpen:B}=d8();return u.createElement(u.Fragment,null,a({account:c?{address:c,balanceDecimals:q?.decimals,balanceFormatted:q?.formatted,balanceSymbol:q?.symbol,displayBalance:t,displayName:s?da(s):c9(c),ensAvatar:r??void 0,ensName:s??void 0,hasPendingTransactions:o}:void 0,accountModalOpen:y,authenticationStatus:h,chain:d?{hasIcon:!!k,iconBackground:l,iconUrl:m,id:d,name:j,unsupported:!f}:void 0,chainModalOpen:z,connectModalOpen:B,mounted:b(),openAccountModal:x??ed,openChainModal:w??ed,openConnectModal:v??ed}))}ee.displayName="ConnectButton.Custom";var ef={accountStatus:"full",chainStatus:{largeScreen:"full",smallScreen:"icon"},label:"Connect Wallet",showBalance:{largeScreen:!0,smallScreen:!1}};function eg({accountStatus:a=ef.accountStatus,chainStatus:b=ef.chainStatus,label:c=ef.label,showBalance:d=ef.showBalance}){let e=b$(),f=a9(),{setShowBalance:g}=b1(),[h,i]=(0,u.useState)(!1),{i18n:j}=(0,u.useContext)(bv);return(0,u.useEffect)(()=>{g(d),h||i(!0)},[d,g]),h?u.createElement(ee,null,({account:g,chain:h,mounted:i,openAccountModal:k,openChainModal:l,openConnectModal:m})=>{let n=i&&"loading"!==f,o=h?.unsupported??!1;return u.createElement(be,{display:"flex",gap:"12",...!n&&{"aria-hidden":!0,style:{opacity:0,pointerEvents:"none",userSelect:"none"}}},n&&g&&"connected"===f?u.createElement(u.Fragment,null,h&&(e.length>1||o)&&u.createElement(be,{alignItems:"center","aria-label":"Chain Selector",as:"button",background:o?"connectButtonBackgroundError":"connectButtonBackground",borderRadius:"connectButton",boxShadow:"connectButton",className:a4({active:"shrink",hover:"grow"}),color:o?"connectButtonTextError":"connectButtonText",display:a$(b,a=>"none"===a?"none":"flex"),fontFamily:"body",fontWeight:"bold",gap:"6",key:o?"unsupported":"supported",onClick:l,paddingX:"10",paddingY:"8",testId:o?"wrong-network-button":"chain-button",transition:"default",type:"button"},o?u.createElement(be,{alignItems:"center",display:"flex",height:"24",paddingX:"4"},j.t("connect_wallet.wrong_network.label")):u.createElement(be,{alignItems:"center",display:"flex",gap:"6"},h.hasIcon?u.createElement(be,{display:a$(b,a=>"full"===a||"icon"===a?"block":"none"),height:"24",width:"24"},u.createElement(bk,{alt:h.name??"Chain icon",background:h.iconBackground,borderRadius:"full",height:"24",src:h.iconUrl,width:"24"})):null,u.createElement(be,{display:a$(b,a=>"icon"!==a||h.iconUrl?"full"===a||"name"===a?"block":"none":"block")},h.name??h.id)),u.createElement(bq,null)),!o&&u.createElement(be,{alignItems:"center",as:"button",background:"connectButtonBackground",borderRadius:"connectButton",boxShadow:"connectButton",className:a4({active:"shrink",hover:"grow"}),color:"connectButtonText",display:"flex",fontFamily:"body",fontWeight:"bold",onClick:k,testId:"account-button",transition:"default",type:"button"},g.displayBalance&&u.createElement(be,{display:a$(d,a=>a?"block":"none"),padding:"8",paddingLeft:"12"},g.displayBalance),u.createElement(be,{background:a_(d)[bc()?"smallScreen":"largeScreen"]?"connectButtonInnerBackground":"connectButtonBackground",borderColor:"connectButtonBackground",borderRadius:"connectButton",borderStyle:"solid",borderWidth:"2",color:"connectButtonText",fontFamily:"body",fontWeight:"bold",paddingX:"8",paddingY:"6",transition:"default"},u.createElement(be,{alignItems:"center",display:"flex",gap:"6",height:"24"},u.createElement(be,{display:a$(a,a=>"full"===a||"avatar"===a?"block":"none")},u.createElement(bp,{address:g.address,imageUrl:g.ensAvatar,loading:g.hasPendingTransactions,size:24})),u.createElement(be,{alignItems:"center",display:"flex",gap:"6"},u.createElement(be,{display:a$(a,a=>"full"===a||"address"===a?"block":"none")},g.displayName),u.createElement(bq,null)))))):u.createElement(be,{as:"button",background:"accentColor",borderRadius:"connectButton",boxShadow:"connectButton",className:a4({active:"shrink",hover:"grow"}),color:"accentColorForeground",fontFamily:"body",fontWeight:"bold",height:"40",key:"connect",onClick:m,paddingX:"14",testId:"connect-button",transition:"default",type:"button"},i&&"Connect Wallet"===c?j.t("connect_wallet.label"):c))}):u.createElement(u.Fragment,null)}function eh({wallet:a="rainbow",children:b}){let c=b2(),{openConnectModal:d}=ec(),{connectModalOpen:e}=d8(),{connector:f,setConnector:g}=(0,u.useContext)(cq),[h]=cI().filter(a=>a.isRainbowKitConnector).filter(b=>b.id.toLowerCase()===a.toLowerCase()).sort((a,b)=>a.groupIndex-b.groupIndex);if(!h)throw Error("Connector not found");let i=a9(),[j,k]=(0,u.useState)(!1),[l,m]=(0,u.useState)(!1),n=bc(),{isConnected:o,isConnecting:p}=(0,A.F)();(0,B.U)({onConnect:()=>{l&&m(!1)},onDisconnect:dD});let q=(0,u.useMemo)(()=>{let a="undefined"!=typeof localStorage&&localStorage.getItem(dB)||"";return!!a&&!!h?.id&&!!o&&a===h?.id},[o,h]),r=async()=>{try{k(!0),l&&m(!1),await h?.connect?.()}catch{m(!0)}finally{k(!1)}},s=!p&&!!d&&h&&"loading"!==i,t=!h?.installed||!h?.ready;return u.createElement(u.Fragment,null,b({error:l,loading:j,connected:q,ready:s,mounted:c(),connector:h,connect:async()=>{if(dC(h?.id||""),n||t){d?.(),g(h);return}await r()}}))}eg.__defaultProps=ef,eg.Custom=ee;var ei=({wallet:a})=>u.createElement(eh,{wallet:a},({ready:a,connect:b,connected:c,mounted:d,connector:e,loading:f})=>{let g=!a||f,{i18n:h}=(0,u.useContext)(bv),i=e?.name||"";if(d)return u.createElement(be,{display:"flex",flexDirection:"column",alignItems:"center",disabled:g,pointerEvents:g?"none":"all"},u.createElement(be,{as:"button",borderRadius:"menuButton",borderStyle:"solid",borderWidth:"1",className:["_1y2lnfi1","_1y2lnfi0",a4({active:"shrink",hover:"grow"})],minHeight:"44",onClick:b,disabled:!a||f,padding:"6",style:{willChange:"transform"},testId:`wallet-button-${e?.id||""}`,transition:"default",width:"full",background:"connectButtonBackground"},u.createElement(be,{color:"modalText",fontFamily:"body",fontSize:"16",fontWeight:"bold",transition:"default",display:"flex",alignItems:"center"},u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"row",gap:"12",paddingRight:"6"},u.createElement(be,null,f?u.createElement(bl,null):u.createElement(bk,{background:e?.iconBackground,borderRadius:"6",height:"28",src:e?.iconUrl,width:"28"})),u.createElement(be,{alignItems:"center",display:"flex",flexDirection:"column",color:"modalText"},u.createElement(be,{testId:`wallet-button-label-${e?.id||""}`},f?h.t("connect.status.connecting",{wallet:i}):i)),c?u.createElement(be,{background:"connectionIndicator",borderColor:"selectedOptionBorder",borderRadius:"full",borderStyle:"solid",borderWidth:"1",height:"8",width:"8"}):null))))});ei.Custom=eh;var ej=({appName:a,appDescription:b,appUrl:c,appIcon:d})=>({name:a,description:b??a,url:c??"",icons:[...d?[d]:[]]}),ek=(a,{projectId:b,walletConnectParameters:c,appName:d,appDescription:e,appUrl:f,appIcon:g})=>{if(!a.length)throw Error("No wallet list was provided");for(let{wallets:b,groupName:c}of a)if(!b.length)throw Error(`No wallets provided for group: ${c}`);let h=-1,i=[],j=[],k=[],l=ej({appName:d,appDescription:e,appUrl:f,appIcon:g});for(let[e,{groupName:f,wallets:i}]of a.entries())for(let a of i){h++;let i=a({projectId:b,appName:d,appIcon:g,options:{metadata:l,...c},walletConnectParameters:{metadata:l,...c}});if(i?.iconAccent&&!dF(i?.iconAccent))throw Error(`Property \`iconAccent\` is not a hex value for wallet: ${i.name}`);let m={...i,groupIndex:e+1,groupName:f,index:h};"function"==typeof i.hidden?k.push(m):j.push(m)}for(let{createConnector:a,groupIndex:b,groupName:c,hidden:d,...e}of function(a,b){let c=[];for(let b of a)c.some(a=>a.id===b.id)||c.push(b);return c}([...j,...k],"id")){if("function"==typeof d&&d())continue;let f=a=>({rkDetails:Object.fromEntries(Object.entries({...e,groupIndex:b,groupName:c,isRainbowKitConnector:!0,...a||{}}).filter(([a,b])=>void 0!==b))});"walletConnect"===e.id&&i.push(a(f({isWalletConnectModalConnector:!0,showQrModal:!0})));let g=a(f());i.push(g)}return i},el=new Map;function em({projectId:a,walletConnectParameters:b}){if(!a||""===a)throw Error("No projectId found. Every dApp must now provide a WalletConnect Cloud projectId to enable WalletConnect v2 https://www.rainbowkit.com/docs/installation#configure");return"YOUR_PROJECT_ID"===a&&(a="21fef48091f12692cad574a6f7753643"),c=>(function({projectId:a,walletDetails:b,walletConnectParameters:c}){return(0,aM.U)(d=>({...(({projectId:a,walletConnectParameters:b,rkDetailsShowQrModal:c,rkDetailsIsWalletConnectModalConnector:d})=>{let e={...b||{},projectId:a,showQrModal:!1};c&&(e={...e,showQrModal:!0}),"customStoragePrefix"in e||(e={...e,customStoragePrefix:d?"clientOne":"clientTwo"});let f=JSON.stringify(e),g=el.get(f);if(g)return g;let h=aS(e);return el.set(f,h),h})({projectId:a,walletConnectParameters:c,rkDetailsShowQrModal:b.rkDetails.showQrModal,rkDetailsIsWalletConnectModalConnector:b.rkDetails.isWalletConnectModalConnector})(d),...b}))})({projectId:a,walletDetails:c,walletConnectParameters:b})}function en(a){let b=void 0;if(void 0===b||void 0===b.ethereum)return;let c=b.ethereum.providers;return c?c.find(b=>b[a]):b.ethereum[a]?b.ethereum:void 0}function eo(a){}var ep=({appName:a,appIcon:b})=>({id:"coinbase",name:"Coinbase Wallet",shortName:"Coinbase",rdns:"com.coinbase.wallet",iconUrl:async()=>(await c.e(7984).then(c.bind(c,87984))).default,iconAccent:"#2c5ff6",iconBackground:"#2c5ff6",installed:!0,downloadUrls:{android:"https://play.google.com/store/apps/details?id=org.toshi",ios:"https://apps.apple.com/us/app/coinbase-wallet-store-crypto/id1278383455",mobile:"https://coinbase.com/wallet/downloads",qrCode:"https://coinbase-wallet.onelink.me/q5Sx/fdb9b250",chrome:"https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",browserExtension:"https://coinbase.com/wallet"},...bb()?{}:{qrCode:{getUri:a=>a,instructions:{learnMoreUrl:"https://coinbase.com/wallet/articles/getting-started-mobile",steps:[{description:"wallet_connectors.coinbase.qr_code.step1.description",step:"install",title:"wallet_connectors.coinbase.qr_code.step1.title"},{description:"wallet_connectors.coinbase.qr_code.step2.description",step:"create",title:"wallet_connectors.coinbase.qr_code.step2.title"},{description:"wallet_connectors.coinbase.qr_code.step3.description",step:"scan",title:"wallet_connectors.coinbase.qr_code.step3.title"}]}},extension:{instructions:{learnMoreUrl:"https://coinbase.com/wallet/articles/getting-started-extension",steps:[{description:"wallet_connectors.coinbase.extension.step1.description",step:"install",title:"wallet_connectors.coinbase.extension.step1.title"},{description:"wallet_connectors.coinbase.extension.step2.description",step:"create",title:"wallet_connectors.coinbase.extension.step2.title"},{description:"wallet_connectors.coinbase.extension.step3.description",step:"refresh",title:"wallet_connectors.coinbase.extension.step3.title"}]}}},createConnector:c=>{let{...d}=ep,e=aU({appName:a,appLogoUrl:b,...d});return(0,aM.U)(a=>({...e(a),...c}))}}),eq=({projectId:a,walletConnectParameters:b})=>{let d=!bc();return{id:"metaMask",name:"MetaMask",rdns:"io.metamask",iconUrl:async()=>(await c.e(9520).then(c.bind(c,39520))).default,iconAccent:"#f6851a",iconBackground:"#fff",installed:void 0,downloadUrls:{android:"https://play.google.com/store/apps/details?id=io.metamask",ios:"https://apps.apple.com/us/app/metamask/id1438144202",mobile:"https://metamask.io/download",qrCode:"https://metamask.io/download",chrome:"https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",edge:"https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm",firefox:"https://addons.mozilla.org/firefox/addon/ether-metamask",opera:"https://addons.opera.com/extensions/details/metamask-10",browserExtension:"https://metamask.io/download"},mobile:{getUri:bc()?a=>a:void 0},qrCode:d?{getUri:a=>`https://metamask.app.link/wc?uri=${encodeURIComponent(a)}`,instructions:{learnMoreUrl:"https://metamask.io/faqs/",steps:[{description:"wallet_connectors.metamask.qr_code.step1.description",step:"install",title:"wallet_connectors.metamask.qr_code.step1.title"},{description:"wallet_connectors.metamask.qr_code.step2.description",step:"create",title:"wallet_connectors.metamask.qr_code.step2.title"},{description:"wallet_connectors.metamask.qr_code.step3.description",step:"refresh",title:"wallet_connectors.metamask.qr_code.step3.title"}]}}:void 0,extension:{instructions:{learnMoreUrl:"https://metamask.io/faqs/",steps:[{description:"wallet_connectors.metamask.extension.step1.description",step:"install",title:"wallet_connectors.metamask.extension.step1.title"},{description:"wallet_connectors.metamask.extension.step2.description",step:"create",title:"wallet_connectors.metamask.extension.step2.title"},{description:"wallet_connectors.metamask.extension.step3.description",step:"refresh",title:"wallet_connectors.metamask.extension.step3.title"}]}},createConnector:d?em({projectId:a,walletConnectParameters:b}):a=>(0,aM.U)(c=>{let d=aY({dappMetadata:{connector:"rainbowkit",name:b?.metadata?.name,iconUrl:b?.metadata?.icons[0],url:b?.metadata?.url},headless:!0,checkInstallationImmediately:!1,enableAnalytics:!1})(c);return{...d,...a,getChainId:async()=>{try{return await d.getChainId()}catch{return c.chains[0]?.id??1}}}})}},er=({projectId:a,walletConnectParameters:b})=>{let d=function({flag:a,namespace:b}){return!!b&&void 0!==eo(b)||!!a&&void 0!==en(a)}({flag:"isRainbow"}),e=!d,f=a=>ba()?a:bb()?`rainbow://wc?uri=${encodeURIComponent(a)}&connector=rainbowkit`:`https://rnbwapp.com/wc?uri=${encodeURIComponent(a)}&connector=rainbowkit`;return{id:"rainbow",name:"Rainbow",rdns:"me.rainbow",iconUrl:async()=>(await c.e(8290).then(c.bind(c,78290))).default,iconBackground:"#0c2f78",installed:e?void 0:d,downloadUrls:{android:"https://play.google.com/store/apps/details?id=me.rainbow&referrer=utm_source%3Drainbowkit&utm_source=rainbowkit",ios:"https://apps.apple.com/app/apple-store/id1457119021?pt=119997837&ct=rainbowkit&mt=8",mobile:"https://rainbow.download?utm_source=rainbowkit",qrCode:"https://rainbow.download?utm_source=rainbowkit&utm_medium=qrcode",browserExtension:"https://rainbow.me/extension?utm_source=rainbowkit"},mobile:{getUri:e?f:void 0},qrCode:e?{getUri:f,instructions:{learnMoreUrl:"https://learn.rainbow.me/connect-to-a-website-or-app?utm_source=rainbowkit&utm_medium=connector&utm_campaign=learnmore",steps:[{description:"wallet_connectors.rainbow.qr_code.step1.description",step:"install",title:"wallet_connectors.rainbow.qr_code.step1.title"},{description:"wallet_connectors.rainbow.qr_code.step2.description",step:"create",title:"wallet_connectors.rainbow.qr_code.step2.title"},{description:"wallet_connectors.rainbow.qr_code.step3.description",step:"scan",title:"wallet_connectors.rainbow.qr_code.step3.title"}]}}:void 0,createConnector:e?em({projectId:a,walletConnectParameters:b}):function({flag:a,namespace:b,target:c}){var d;return d=c||function({flag:a,namespace:b}){let c=void 0;if(void 0===c)return;if(b){let a=eo(b);if(a)return a}let d=c.ethereum?.providers;if(a){let b=en(a);if(b)return b}return void 0!==d&&d.length>0?d[0]:c.ethereum}({flag:a,namespace:b}),a=>{let b=d?{target:()=>({id:a.rkDetails.id,name:a.rkDetails.name,provider:d})}:{};return(0,aM.U)(c=>({...(0,aT.b)(b)(c),...a}))}}({flag:"isRainbow"})}},es=()=>({id:"safe",name:"Safe",iconAccent:"#12ff80",iconBackground:"#fff",iconUrl:async()=>(await c.e(3030).then(c.bind(c,43030))).default,installed:!1,downloadUrls:{},createConnector:a=>(0,aM.U)(b=>({...aZ()(b),...a}))}),et=({projectId:a,options:b})=>({id:"walletConnect",name:"WalletConnect",installed:void 0,iconUrl:async()=>(await c.e(9860).then(c.bind(c,9860))).default,iconBackground:"#3b99fc",qrCode:{getUri:a=>a},createConnector:em({projectId:a,walletConnectParameters:b})}),eu=({appName:a,appDescription:b,appUrl:c,appIcon:d,wallets:e,projectId:f,...g})=>{let{transports:h,chains:i,...j}=g,k=ej({appName:a,appDescription:b,appUrl:c,appIcon:d}),l=ek(e||[{groupName:"Popular",wallets:[es,er,ep,eq,et]}],{projectId:f,appName:a,appDescription:b,appUrl:c,appIcon:d,walletConnectParameters:{metadata:k}});return(0,aL.Z)({connectors:l,chains:i,transports:h||i.reduce((a,b)=>(a[b.id]=(0,aK.L)(),a),{}),...j})};function ev(a){let b=[{groupName:"Popular",wallets:[es,er,ep,eq,et]}];return a?{connectors:ek(b,a),wallets:b}:{wallets:b}}function ew(){let a=ch(),{address:b}=(0,A.F)(),c=cb();return(0,u.useCallback)(d=>{if(!b||!c)throw Error("No address or chain ID found");a.addTransaction(b,c,d)},[a,b,c])}var ex={DesktopOptions:d$,dialogContent:c3,dialogContentMobile:c4,MobileOptions:d1}},68447:(a,b,c)=>{"use strict";function d(a){return{formatters:void 0,fees:void 0,serializers:void 0,...a}}c.d(b,{x:()=>d})},74899:function(a,b,c){var d;!function(e,f){"use strict";var g="function",h="undefined",i="object",j="string",k="major",l="model",m="name",n="type",o="vendor",p="version",q="architecture",r="console",s="mobile",t="tablet",u="smarttv",v="wearable",w="embedded",x="Amazon",y="Apple",z="ASUS",A="BlackBerry",B="Browser",C="Chrome",D="Firefox",E="Google",F="Honor",G="Huawei",H="Microsoft",I="Motorola",J="Nvidia",K="OnePlus",L="Opera",M="OPPO",N="Samsung",O="Sharp",P="Sony",Q="Xiaomi",R="Zebra",S="Facebook",T="Chromium OS",U="Mac OS",V=" Browser",W=function(a,b){var c={};for(var d in a)b[d]&&b[d].length%2==0?c[d]=b[d].concat(a[d]):c[d]=a[d];return c},X=function(a){for(var b={},c=0;c<a.length;c++)b[a[c].toUpperCase()]=a[c];return b},Y=function(a,b){return typeof a===j&&-1!==Z(b).indexOf(Z(a))},Z=function(a){return a.toLowerCase()},$=function(a,b){if(typeof a===j)return a=a.replace(/^\s\s*/,""),typeof b===h?a:a.substring(0,500)},_=function(a,b){for(var c,d,e,h,j,k,l=0;l<b.length&&!j;){var m=b[l],n=b[l+1];for(c=d=0;c<m.length&&!j&&m[c];)if(j=m[c++].exec(a))for(e=0;e<n.length;e++)k=j[++d],typeof(h=n[e])===i&&h.length>0?2===h.length?typeof h[1]==g?this[h[0]]=h[1].call(this,k):this[h[0]]=h[1]:3===h.length?typeof h[1]!==g||h[1].exec&&h[1].test?this[h[0]]=k?k.replace(h[1],h[2]):void 0:this[h[0]]=k?h[1].call(this,k,h[2]):void 0:4===h.length&&(this[h[0]]=k?h[3].call(this,k.replace(h[1],h[2])):f):this[h]=k||f;l+=2}},aa=function(a,b){for(var c in b)if(typeof b[c]===i&&b[c].length>0){for(var d=0;d<b[c].length;d++)if(Y(b[c][d],a))return"?"===c?f:c}else if(Y(b[c],a))return"?"===c?f:c;return b.hasOwnProperty("*")?b["*"]:a},ab={ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2e3:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2","8.1":"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"},ac={browser:[[/\b(?:crmo|crios)\/([\w\.]+)/i],[p,[m,"Chrome"]],[/edg(?:e|ios|a)?\/([\w\.]+)/i],[p,[m,"Edge"]],[/(opera mini)\/([-\w\.]+)/i,/(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,/(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i],[m,p],[/opios[\/ ]+([\w\.]+)/i],[p,[m,L+" Mini"]],[/\bop(?:rg)?x\/([\w\.]+)/i],[p,[m,L+" GX"]],[/\bopr\/([\w\.]+)/i],[p,[m,L]],[/\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i],[p,[m,"Baidu"]],[/\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i],[p,[m,"Maxthon"]],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,/(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,/(?:ms|\()(ie) ([\w\.]+)/i,/(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,/(heytap|ovi|115)browser\/([\d\.]+)/i,/(weibo)__([\d\.]+)/i],[m,p],[/quark(?:pc)?\/([-\w\.]+)/i],[p,[m,"Quark"]],[/\bddg\/([\w\.]+)/i],[p,[m,"DuckDuckGo"]],[/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],[p,[m,"UC"+B]],[/microm.+\bqbcore\/([\w\.]+)/i,/\bqbcore\/([\w\.]+).+microm/i,/micromessenger\/([\w\.]+)/i],[p,[m,"WeChat"]],[/konqueror\/([\w\.]+)/i],[p,[m,"Konqueror"]],[/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],[p,[m,"IE"]],[/ya(?:search)?browser\/([\w\.]+)/i],[p,[m,"Yandex"]],[/slbrowser\/([\w\.]+)/i],[p,[m,"Smart Lenovo "+B]],[/(avast|avg)\/([\w\.]+)/i],[[m,/(.+)/,"$1 Secure "+B],p],[/\bfocus\/([\w\.]+)/i],[p,[m,D+" Focus"]],[/\bopt\/([\w\.]+)/i],[p,[m,L+" Touch"]],[/coc_coc\w+\/([\w\.]+)/i],[p,[m,"Coc Coc"]],[/dolfin\/([\w\.]+)/i],[p,[m,"Dolphin"]],[/coast\/([\w\.]+)/i],[p,[m,L+" Coast"]],[/miuibrowser\/([\w\.]+)/i],[p,[m,"MIUI"+V]],[/fxios\/([\w\.-]+)/i],[p,[m,D]],[/\bqihoobrowser\/?([\w\.]*)/i],[p,[m,"360"]],[/\b(qq)\/([\w\.]+)/i],[[m,/(.+)/,"$1Browser"],p],[/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i],[[m,/(.+)/,"$1"+V],p],[/samsungbrowser\/([\w\.]+)/i],[p,[m,N+" Internet"]],[/metasr[\/ ]?([\d\.]+)/i],[p,[m,"Sogou Explorer"]],[/(sogou)mo\w+\/([\d\.]+)/i],[[m,"Sogou Mobile"],p],[/(electron)\/([\w\.]+) safari/i,/(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,/m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i],[m,p],[/(lbbrowser|rekonq)/i,/\[(linkedin)app\]/i],[m],[/ome\/([\w\.]+) \w* ?(iron) saf/i,/ome\/([\w\.]+).+qihu (360)[es]e/i],[p,m],[/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],[[m,S],p],[/(Klarna)\/([\w\.]+)/i,/(kakao(?:talk|story))[\/ ]([\w\.]+)/i,/(naver)\(.*?(\d+\.[\w\.]+).*\)/i,/(daum)apps[\/ ]([\w\.]+)/i,/safari (line)\/([\w\.]+)/i,/\b(line)\/([\w\.]+)\/iab/i,/(alipay)client\/([\w\.]+)/i,/(twitter)(?:and| f.+e\/([\w\.]+))/i,/(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i],[m,p],[/\bgsa\/([\w\.]+) .*safari\//i],[p,[m,"GSA"]],[/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],[p,[m,"TikTok"]],[/headlesschrome(?:\/([\w\.]+)| )/i],[p,[m,C+" Headless"]],[/ wv\).+(chrome)\/([\w\.]+)/i],[[m,C+" WebView"],p],[/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],[p,[m,"Android "+B]],[/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],[m,p],[/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],[p,[m,"Mobile Safari"]],[/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],[p,m],[/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],[m,[p,aa,{"1.0":"/8","1.2":"/1","1.3":"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}]],[/(webkit|khtml)\/([\w\.]+)/i],[m,p],[/(navigator|netscape\d?)\/([-\w\.]+)/i],[[m,"Netscape"],p],[/(wolvic|librewolf)\/([\w\.]+)/i],[m,p],[/mobile vr; rv:([\w\.]+)\).+firefox/i],[p,[m,D+" Reality"]],[/ekiohf.+(flow)\/([\w\.]+)/i,/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,/(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,/(firefox)\/([\w\.]+)/i,/(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,/(amaya|dillo|doris|icab|ladybird|lynx|mosaic|netsurf|obigo|polaris|w3m|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,/\b(links) \(([\w\.]+)/i],[m,[p,/_/g,"."]],[/(cobalt)\/([\w\.]+)/i],[m,[p,/master.|lts./,""]]],cpu:[[/\b((amd|x|x86[-_]?|wow|win)64)\b/i],[[q,"amd64"]],[/(ia32(?=;))/i,/\b((i[346]|x)86)(pc)?\b/i],[[q,"ia32"]],[/\b(aarch64|arm(v?[89]e?l?|_?64))\b/i],[[q,"arm64"]],[/\b(arm(v[67])?ht?n?[fl]p?)\b/i],[[q,"armhf"]],[/( (ce|mobile); ppc;|\/[\w\.]+arm\b)/i],[[q,"arm"]],[/((ppc|powerpc)(64)?)( mac|;|\))/i],[[q,/ower/,"",Z]],[/ sun4\w[;\)]/i],[[q,"sparc"]],[/\b(avr32|ia64(?=;)|68k(?=\))|\barm(?=v([1-7]|[5-7]1)l?|;|eabi)|(irix|mips|sparc)(64)?\b|pa-risc)/i],[[q,Z]]],device:[[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],[l,[o,N],[n,t]],[/\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,/samsung[- ]((?!sm-[lr])[-\w]+)/i,/sec-(sgh\w+)/i],[l,[o,N],[n,s]],[/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],[l,[o,y],[n,s]],[/\((ipad);[-\w\),; ]+apple/i,/applecoremedia\/[\w\.]+ \((ipad)/i,/\b(ipad)\d\d?,\d\d?[;\]].+ios/i],[l,[o,y],[n,t]],[/(macintosh);/i],[l,[o,y]],[/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],[l,[o,O],[n,s]],[/\b((?:brt|eln|hey2?|gdi|jdn)-a?[lnw]09|(?:ag[rm]3?|jdn2|kob2)-a?[lw]0[09]hn)(?: bui|\)|;)/i],[l,[o,F],[n,t]],[/honor([-\w ]+)[;\)]/i],[l,[o,F],[n,s]],[/\b((?:ag[rs][2356]?k?|bah[234]?|bg[2o]|bt[kv]|cmr|cpn|db[ry]2?|jdn2|got|kob2?k?|mon|pce|scm|sht?|[tw]gr|vrd)-[ad]?[lw][0125][09]b?|605hw|bg2-u03|(?:gem|fdr|m2|ple|t1)-[7a]0[1-4][lu]|t1-a2[13][lw]|mediapad[\w\. ]*(?= bui|\)))\b(?!.+d\/s)/i],[l,[o,G],[n,t]],[/(?:huawei)([-\w ]+)[;\)]/i,/\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i],[l,[o,G],[n,s]],[/oid[^\)]+; (2[\dbc]{4}(182|283|rp\w{2})[cgl]|m2105k81a?c)(?: bui|\))/i,/\b((?:red)?mi[-_ ]?pad[\w- ]*)(?: bui|\))/i],[[l,/_/g," "],[o,Q],[n,t]],[/\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,/\b; (\w+) build\/hm\1/i,/\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,/\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,/oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,/\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i,/ ([\w ]+) miui\/v?\d/i],[[l,/_/g," "],[o,Q],[n,s]],[/; (\w+) bui.+ oppo/i,/\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i],[l,[o,M],[n,s]],[/\b(opd2(\d{3}a?))(?: bui|\))/i],[l,[o,aa,{OnePlus:["304","403","203"],"*":M}],[n,t]],[/vivo (\w+)(?: bui|\))/i,/\b(v[12]\d{3}\w?[at])(?: bui|;)/i],[l,[o,"Vivo"],[n,s]],[/\b(rmx[1-3]\d{3})(?: bui|;|\))/i],[l,[o,"Realme"],[n,s]],[/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,/\bmot(?:orola)?[- ](\w*)/i,/((?:moto(?! 360)[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i],[l,[o,I],[n,s]],[/\b(mz60\d|xoom[2 ]{0,2}) build\//i],[l,[o,I],[n,t]],[/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],[l,[o,"LG"],[n,t]],[/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,/\blg[-e;\/ ]+((?!browser|netcast|android tv|watch)\w+)/i,/\blg-?([\d\w]+) bui/i],[l,[o,"LG"],[n,s]],[/(ideatab[-\w ]+|602lv|d-42a|a101lv|a2109a|a3500-hv|s[56]000|pb-6505[my]|tb-?x?\d{3,4}(?:f[cu]|xu|[av])|yt\d?-[jx]?\d+[lfmx])( bui|;|\)|\/)/i,/lenovo ?(b[68]0[08]0-?[hf]?|tab(?:[\w- ]+?)|tb[\w-]{6,7})( bui|;|\)|\/)/i],[l,[o,"Lenovo"],[n,t]],[/(nokia) (t[12][01])/i],[o,l,[n,t]],[/(?:maemo|nokia).*(n900|lumia \d+|rm-\d+)/i,/nokia[-_ ]?(([-\w\. ]*))/i],[[l,/_/g," "],[n,s],[o,"Nokia"]],[/(pixel (c|tablet))\b/i],[l,[o,E],[n,t]],[/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],[l,[o,E],[n,s]],[/droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i],[l,[o,P],[n,s]],[/sony tablet [ps]/i,/\b(?:sony)?sgp\w+(?: bui|\))/i],[[l,"Xperia Tablet"],[o,P],[n,t]],[/ (kb2005|in20[12]5|be20[12][59])\b/i,/(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],[l,[o,K],[n,s]],[/(alexa)webm/i,/(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,/(kf[a-z]+)( bui|\)).+silk\//i],[l,[o,x],[n,t]],[/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],[[l,/(.+)/g,"Fire Phone $1"],[o,x],[n,s]],[/(playbook);[-\w\),; ]+(rim)/i],[l,o,[n,t]],[/\b((?:bb[a-f]|st[hv])100-\d)/i,/\(bb10; (\w+)/i],[l,[o,A],[n,s]],[/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],[l,[o,z],[n,t]],[/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],[l,[o,z],[n,s]],[/(nexus 9)/i],[l,[o,"HTC"],[n,t]],[/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,/(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,/(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i],[o,[l,/_/g," "],[n,s]],[/droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i],[l,[o,"TCL"],[n,t]],[/(itel) ((\w+))/i],[[o,Z],l,[n,aa,{tablet:["p10001l","w7001"],"*":"mobile"}]],[/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],[l,[o,"Acer"],[n,t]],[/droid.+; (m[1-5] note) bui/i,/\bmz-([-\w]{2,})/i],[l,[o,"Meizu"],[n,s]],[/; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i],[l,[o,"Ulefone"],[n,s]],[/; (energy ?\w+)(?: bui|\))/i,/; energizer ([\w ]+)(?: bui|\))/i],[l,[o,"Energizer"],[n,s]],[/; cat (b35);/i,/; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i],[l,[o,"Cat"],[n,s]],[/((?:new )?andromax[\w- ]+)(?: bui|\))/i],[l,[o,"Smartfren"],[n,s]],[/droid.+; (a(?:015|06[35]|142p?))/i],[l,[o,"Nothing"],[n,s]],[/; (x67 5g|tikeasy \w+|ac[1789]\d\w+)( b|\))/i,/archos ?(5|gamepad2?|([\w ]*[t1789]|hello) ?\d+[\w ]*)( b|\))/i],[l,[o,"Archos"],[n,t]],[/archos ([\w ]+)( b|\))/i,/; (ac[3-6]\d\w{2,8})( b|\))/i],[l,[o,"Archos"],[n,s]],[/(imo) (tab \w+)/i,/(infinix) (x1101b?)/i],[o,l,[n,t]],[/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus(?! zenw)|dell|jolla|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,/; (hmd|imo) ([\w ]+?)(?: bui|\))/i,/(hp) ([\w ]+\w)/i,/(microsoft); (lumia[\w ]+)/i,/(lenovo)[-_ ]?([-\w ]+?)(?: bui|\)|\/)/i,/(oppo) ?([\w ]+) bui/i],[o,l,[n,s]],[/(kobo)\s(ereader|touch)/i,/(hp).+(touchpad(?!.+tablet)|tablet)/i,/(kindle)\/([\w\.]+)/i,/(nook)[\w ]+build\/(\w+)/i,/(dell) (strea[kpr\d ]*[\dko])/i,/(le[- ]+pan)[- ]+(\w{1,9}) bui/i,/(trinity)[- ]*(t\d{3}) bui/i,/(gigaset)[- ]+(q\w{1,9}) bui/i,/(vodafone) ([\w ]+)(?:\)| bui)/i],[o,l,[n,t]],[/(surface duo)/i],[l,[o,H],[n,t]],[/droid [\d\.]+; (fp\du?)(?: b|\))/i],[l,[o,"Fairphone"],[n,s]],[/(u304aa)/i],[l,[o,"AT&T"],[n,s]],[/\bsie-(\w*)/i],[l,[o,"Siemens"],[n,s]],[/\b(rct\w+) b/i],[l,[o,"RCA"],[n,t]],[/\b(venue[\d ]{2,7}) b/i],[l,[o,"Dell"],[n,t]],[/\b(q(?:mv|ta)\w+) b/i],[l,[o,"Verizon"],[n,t]],[/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],[l,[o,"Barnes & Noble"],[n,t]],[/\b(tm\d{3}\w+) b/i],[l,[o,"NuVision"],[n,t]],[/\b(k88) b/i],[l,[o,"ZTE"],[n,t]],[/\b(nx\d{3}j) b/i],[l,[o,"ZTE"],[n,s]],[/\b(gen\d{3}) b.+49h/i],[l,[o,"Swiss"],[n,s]],[/\b(zur\d{3}) b/i],[l,[o,"Swiss"],[n,t]],[/\b((zeki)?tb.*\b) b/i],[l,[o,"Zeki"],[n,t]],[/\b([yr]\d{2}) b/i,/\b(dragon[- ]+touch |dt)(\w{5}) b/i],[[o,"Dragon Touch"],l,[n,t]],[/\b(ns-?\w{0,9}) b/i],[l,[o,"Insignia"],[n,t]],[/\b((nxa|next)-?\w{0,9}) b/i],[l,[o,"NextBook"],[n,t]],[/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],[[o,"Voice"],l,[n,s]],[/\b(lvtel\-)?(v1[12]) b/i],[[o,"LvTel"],l,[n,s]],[/\b(ph-1) /i],[l,[o,"Essential"],[n,s]],[/\b(v(100md|700na|7011|917g).*\b) b/i],[l,[o,"Envizen"],[n,t]],[/\b(trio[-\w\. ]+) b/i],[l,[o,"MachSpeed"],[n,t]],[/\btu_(1491) b/i],[l,[o,"Rotor"],[n,t]],[/((?:tegranote|shield t(?!.+d tv))[\w- ]*?)(?: b|\))/i],[l,[o,J],[n,t]],[/(sprint) (\w+)/i],[o,l,[n,s]],[/(kin\.[onetw]{3})/i],[[l,/\./g," "],[o,H],[n,s]],[/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],[l,[o,R],[n,t]],[/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],[l,[o,R],[n,s]],[/smart-tv.+(samsung)/i],[o,[n,u]],[/hbbtv.+maple;(\d+)/i],[[l,/^/,"SmartTV"],[o,N],[n,u]],[/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],[[o,"LG"],[n,u]],[/(apple) ?tv/i],[o,[l,y+" TV"],[n,u]],[/crkey/i],[[l,C+"cast"],[o,E],[n,u]],[/droid.+aft(\w+)( bui|\))/i],[l,[o,x],[n,u]],[/(shield \w+ tv)/i],[l,[o,J],[n,u]],[/\(dtv[\);].+(aquos)/i,/(aquos-tv[\w ]+)\)/i],[l,[o,O],[n,u]],[/(bravia[\w ]+)( bui|\))/i],[l,[o,P],[n,u]],[/(mi(tv|box)-?\w+) bui/i],[l,[o,Q],[n,u]],[/Hbbtv.*(technisat) (.*);/i],[o,l,[n,u]],[/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,/hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i],[[o,$],[l,$],[n,u]],[/droid.+; ([\w- ]+) (?:android tv|smart[- ]?tv)/i],[l,[n,u]],[/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],[[n,u]],[/(ouya)/i,/(nintendo) ([wids3utch]+)/i],[o,l,[n,r]],[/droid.+; (shield)( bui|\))/i],[l,[o,J],[n,r]],[/(playstation \w+)/i],[l,[o,P],[n,r]],[/\b(xbox(?: one)?(?!; xbox))[\); ]/i],[l,[o,H],[n,r]],[/\b(sm-[lr]\d\d[0156][fnuw]?s?|gear live)\b/i],[l,[o,N],[n,v]],[/((pebble))app/i,/(asus|google|lg|oppo) ((pixel |zen)?watch[\w ]*)( bui|\))/i],[o,l,[n,v]],[/(ow(?:19|20)?we?[1-3]{1,3})/i],[l,[o,M],[n,v]],[/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],[l,[o,y],[n,v]],[/(opwwe\d{3})/i],[l,[o,K],[n,v]],[/(moto 360)/i],[l,[o,I],[n,v]],[/(smartwatch 3)/i],[l,[o,P],[n,v]],[/(g watch r)/i],[l,[o,"LG"],[n,v]],[/droid.+; (wt63?0{2,3})\)/i],[l,[o,R],[n,v]],[/droid.+; (glass) \d/i],[l,[o,E],[n,v]],[/(pico) (4|neo3(?: link|pro)?)/i],[o,l,[n,v]],[/; (quest( \d| pro)?)/i],[l,[o,S],[n,v]],[/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],[o,[n,w]],[/(aeobc)\b/i],[l,[o,x],[n,w]],[/(homepod).+mac os/i],[l,[o,y],[n,w]],[/windows iot/i],[[n,w]],[/droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i],[l,[n,s]],[/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],[l,[n,t]],[/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],[[n,t]],[/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],[[n,s]],[/droid .+?; ([\w\. -]+)( bui|\))/i],[l,[o,"Generic"]]],engine:[[/windows.+ edge\/([\w\.]+)/i],[p,[m,"EdgeHTML"]],[/(arkweb)\/([\w\.]+)/i],[m,p],[/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],[p,[m,"Blink"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i,/ekioh(flow)\/([\w\.]+)/i,/(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,/(icab)[\/ ]([23]\.[\d\.]+)/i,/\b(libweb)/i],[m,p],[/ladybird\//i],[[m,"LibWeb"]],[/rv\:([\w\.]{1,9})\b.+(gecko)/i],[p,m]],os:[[/microsoft (windows) (vista|xp)/i],[m,p],[/(windows (?:phone(?: os)?|mobile|iot))[\/ ]?([\d\.\w ]*)/i],[m,[p,aa,ab]],[/windows nt 6\.2; (arm)/i,/windows[\/ ]([ntce\d\. ]+\w)(?!.+xbox)/i,/(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i],[[p,aa,ab],[m,"Windows"]],[/[adehimnop]{4,7}\b(?:.*os ([\w]+) like mac|; opera)/i,/(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,/cfnetwork\/.+darwin/i],[[p,/_/g,"."],[m,"iOS"]],[/(mac os x) ?([\w\. ]*)/i,/(macintosh|mac_powerpc\b)(?!.+haiku)/i],[[m,U],[p,/_/g,"."]],[/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],[p,m],[/(ubuntu) ([\w\.]+) like android/i],[[m,/(.+)/,"$1 Touch"],p],[/(android|bada|blackberry|kaios|maemo|meego|openharmony|qnx|rim tablet os|sailfish|series40|symbian|tizen|webos)\w*[-\/; ]?([\d\.]*)/i],[m,p],[/\(bb(10);/i],[p,[m,A]],[/(?:symbian ?os|symbos|s60(?=;)|series ?60)[-\/ ]?([\w\.]*)/i],[p,[m,"Symbian"]],[/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],[p,[m,D+" OS"]],[/web0s;.+rt(tv)/i,/\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],[p,[m,"webOS"]],[/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],[p,[m,"watchOS"]],[/crkey\/([\d\.]+)/i],[p,[m,C+"cast"]],[/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],[[m,T],p],[/panasonic;(viera)/i,/(netrange)mmh/i,/(nettv)\/(\d+\.[\w\.]+)/i,/(nintendo|playstation) ([wids345portablevuch]+)/i,/(xbox); +xbox ([^\);]+)/i,/\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,/(mint)[\/\(\) ]?(\w*)/i,/(mageia|vectorlinux)[; ]/i,/([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,/(hurd|linux)(?: arm\w*| x86\w*| ?)([\w\.]*)/i,/(gnu) ?([\w\.]*)/i,/\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,/(haiku) (\w+)/i],[m,p],[/(sunos) ?([\w\.\d]*)/i],[[m,"Solaris"],p],[/((?:open)?solaris)[-\/ ]?([\w\.]*)/i,/(aix) ((\d)(?=\.|\)| )[\w\.])*/i,/\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,/(unix) ?([\w\.]*)/i],[m,p]]},ad=function(a,b){if(typeof a===i&&(b=a,a=f),!(this instanceof ad))return new ad(a,b).getResult();var c=typeof e!==h&&e.navigator?e.navigator:f,d=a||(c&&c.userAgent?c.userAgent:""),r=c&&c.userAgentData?c.userAgentData:f,u=b?W(ac,b):ac,v=c&&c.userAgent==d;return this.getBrowser=function(){var a,b={};return b[m]=f,b[p]=f,_.call(b,d,u.browser),b[k]=typeof(a=b[p])===j?a.replace(/[^\d\.]/g,"").split(".")[0]:f,v&&c&&c.brave&&typeof c.brave.isBrave==g&&(b[m]="Brave"),b},this.getCPU=function(){var a={};return a[q]=f,_.call(a,d,u.cpu),a},this.getDevice=function(){var a={};return a[o]=f,a[l]=f,a[n]=f,_.call(a,d,u.device),v&&!a[n]&&r&&r.mobile&&(a[n]=s),v&&"Macintosh"==a[l]&&c&&typeof c.standalone!==h&&c.maxTouchPoints&&c.maxTouchPoints>2&&(a[l]="iPad",a[n]=t),a},this.getEngine=function(){var a={};return a[m]=f,a[p]=f,_.call(a,d,u.engine),a},this.getOS=function(){var a={};return a[m]=f,a[p]=f,_.call(a,d,u.os),v&&!a[m]&&r&&r.platform&&"Unknown"!=r.platform&&(a[m]=r.platform.replace(/chrome os/i,T).replace(/macos/i,U)),a},this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}},this.getUA=function(){return d},this.setUA=function(a){return d=typeof a===j&&a.length>500?$(a,500):a,this},this.setUA(d),this};ad.VERSION="1.0.41",ad.BROWSER=X([m,p,k]),ad.CPU=X([q]),ad.DEVICE=X([l,o,n,r,s,u,t,v,w]),ad.ENGINE=ad.OS=X([m,p]),typeof b!==h?(a.exports&&(b=a.exports=ad),b.UAParser=ad):c.amdO?f===(d=(function(){return ad}).call(b,c,b,a))||(a.exports=d):typeof e!==h&&(e.UAParser=ad);var ae=typeof e!==h&&(e.jQuery||e.Zepto);if(ae&&!ae.ua){var af=new ad;ae.ua=af.getResult(),ae.ua.get=function(){return af.getUA()},ae.ua.set=function(a){af.setUA(a);var b=af.getResult();for(var c in b)ae.ua[c]=b[c]}}}("object"==typeof window?window:this)},92619:(a,b,c)=>{"use strict";c.d(b,{r:()=>d});let d=(0,c(68447).x)({id:1,name:"Ethereum",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},blockTime:12e3,rpcUrls:{default:{http:["https://eth.merkle.io"]}},blockExplorers:{default:{name:"Etherscan",url:"https://etherscan.io",apiUrl:"https://api.etherscan.io/api"}},contracts:{ensUniversalResolver:{address:"0xeeeeeeee14d718c2b47d9923deab1335e144eeee",blockCreated:0x16041f6},multicall3:{address:"0xca11bde05977b3631167028862be2a173976ca11",blockCreated:0xdb04c1}}})}};