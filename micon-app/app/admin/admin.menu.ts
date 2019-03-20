export const ADMIN_MENU = [
  {
    path: 'sysadmin',
    children: [
      {
        path: 'dashboard',
        data: {
          menu: {
            title: 'Dashboard',
            icon: 'ion-android-home',
            selected: false,
            expanded: false,
            order: 0
          }
        }
      },
      {
        path: 'competitions',
        data: {
          menu: {
            title: 'Competitions',
            icon: 'fa fa-tasks',
            selected: false,
            expanded: false,
            order: 500,
          }
        },
        children: [
          {
            path: 'all',
            data: {
              menu: {
                title: 'All Competitions',
              }
            }
          },
          {
            path: 'add',
            data: {
              menu: {
                title: 'Add New',
              }
            }
          }
        ]
      },
      {
        path: 'submissions',
        data: {
          menu: {
            title: 'Submissions',
            icon: 'fa fa-upload',
            selected: false,
            expanded: false,
            order: 500,
          }
        },
        children: [
          {
            path: 'all',
            data: {
              menu: {
                title: 'All Submissions',
              }
            }
          }
        ]
      },
      {
        path: 'forums',
        data: {
          menu: {
            title: 'Forums',
            icon: 'fa fa-comments',
            selected: false,
            expanded: false,
            order: 500,
          }
        },
        children: [
          {
            path: 'all',
            data: {
              menu: {
                title: 'All Forums',
              }
            }
          }
        ]
      },
      {
        path: 'payments',
        data: {
          menu: {
            title: 'Payment',
            icon: 'fa fa-money',
            selected: false,
            expanded: false,
            order: 500,
          }
        },
        children: [
          {
            path: 'all',
            data: {
              menu: {
                title: 'All Payments',
              }
            }
          }
        ]
      },
      {
        path: 'settings',
        data: {
          menu: {
            title: 'Settings',
            icon: 'fa fa-sliders',
            selected: false,
            expanded: false,
            order: 500,
          }
        },
        children: [
          {
            path: 'slides',
            data: {
              menu: {
                title: 'Front page',
              }
            }
          },
          {
            path: 'site',
            data: {
              menu: {
                title: 'Site settings',
              }
            }
          },
        ]
      },
      {
        path: 'users',
        data: {
          menu: {
            title: 'Manage users',
            icon: 'fa fa-users',
            selected: false,
            expanded: false,
            order: 500,
          }
        },
        children: [
          {
            path: 'all',
            data: {
              menu: {
                title: 'All users',
              }
            }
          },
          //{
          //  path: 'add',
          //  data: {
          //    menu: {
          //      title: 'Add New',
          //    }
          //  }
          //}
        ]
      },
    ]
  }
];
