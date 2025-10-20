Nguyễn Trí Dũng - 22IT050
# Pomodoro — React Native (Expo)

Ứng dụng Pomodoro đơn giản xây bằng Expo + React Native để quản lý phiên tập trung (Work) và nghỉ ngơi (Break), kèm lưu lịch sử, thống kê 7 ngày và thông báo khi kết thúc phiên.

## Tính năng chính
- Timer đếm ngược cho chế độ Work / Break.
- Start / Pause / Reset, chuyển chế độ thủ công khi chưa chạy.
- Lưu lịch sử phiên (AsyncStorage).
- Thống kê 7 ngày gần nhất.
- Thông báo khi phiên kết thúc (Expo Notifications).
- Haptic feedback (thiết bị di động), giữ màn hình sáng khi chạy.

## Yêu cầu hệ thống
- Node.js (>= 16)
- npm hoặc Yarn
- Expo CLI (khuyến nghị)
- Thiết bị thật hoặc emulator / simulator để thử Notifications và Haptics

## Cài đặt & chạy (Windows)
Mở terminal (PowerShell hoặc CMD) trong thư mục dự án:

1. Cài dependencies
```powershell
npm install
# hoặc
yarn install
```

2. Chạy project (Expo)
```powershell
npm run start
# hoặc
yarn start
```

3. Mở trên thiết bị / simulator
- Android: npm run android
- iOS (macOS + Xcode): npm run ios
- Web: npm run web

## Cấu trúc thư mục (tóm tắt)
- components/pomodoro-timer.tsx — component chính chứa UI và logic timer
- utils/storage.ts — lưu / đọc session & settings (AsyncStorage)
- utils/notifications.ts — cấp quyền và quản lý notifications (Expo Notifications)
- utils/stats.ts — hàm trợ giúp cho thống kê và format thời gian
- types/pomodoro.ts — định nghĩa TypeScript cho session / settings
- app.json, tsconfig.json, package.json — cấu hình project

## Cách hoạt động nhanh
- Khi timer hoàn tất: lưu PomodoroSession, gửi notification, bật haptic feedback và chuyển sang chế độ kế tiếp.
- Settings lưu persist bằng AsyncStorage; thay đổi settings khi timer không chạy sẽ cập nhật thời gian hiện tại.
- Thống kê lấy dữ liệu trong 7 ngày gần nhất từ sessions đã lưu.

## Lưu ý phát triển
- Notifications yêu cầu permission của người dùng — kiểm tra hàm setupNotifications trong utils/notifications.ts.
- Trên web một số API (Haptics, KeepAwake, native notifications) không hoạt động.
- Để reset dữ liệu test, xóa AsyncStorage tương ứng hoặc thêm helper trong utils/storage.ts.

## Kiểm thử
- Chạy app trên thiết bị thật để kiểm tra Notifications & Haptics.
- Kiểm tra lưu / đọc session bằng việc hoàn tất một vài phiên và quan sát phần Stats.

## Đóng góp
PR, issue và cải tiến chào đón. Vui lòng tuân theo code style, viết mô tả rõ ràng cho PR.

## License
MIT
```// filepath: d:\reatnative\Pomodoro-react-native\README.md
// ...existing code...
# Pomodoro — React Native (Expo)

Ứng dụng Pomodoro đơn giản xây bằng Expo + React Native để quản lý phiên tập trung (Work) và nghỉ ngơi (Break), kèm lưu lịch sử, thống kê 7 ngày và thông báo khi kết thúc phiên.

## Tính năng chính
- Timer đếm ngược cho chế độ Work / Break.
- Start / Pause / Reset, chuyển chế độ thủ công khi chưa chạy.
- Lưu lịch sử phiên (AsyncStorage).
- Thống kê 7 ngày gần nhất.
- Thông báo khi phiên kết thúc (Expo Notifications).
- Haptic feedback (thiết bị di động), giữ màn hình sáng khi chạy.

## Yêu cầu hệ thống
- Node.js (>= 16)
- npm hoặc Yarn
- Expo CLI (khuyến nghị)
- Thiết bị thật hoặc emulator / simulator để thử Notifications và Haptics

## Cài đặt & chạy (Windows)
Mở terminal (PowerShell hoặc CMD) trong thư mục dự án:

1. Cài dependencies
```powershell
npm install
# hoặc
yarn install
```

2. Chạy project (Expo)
```powershell
npm run start
# hoặc
yarn start
```

3. Mở trên thiết bị / simulator
- Android: npm run android
- iOS (macOS + Xcode): npm run ios
- Web: npm run web

## Cấu trúc thư mục (tóm tắt)
- components/pomodoro-timer.tsx — component chính chứa UI và logic timer
- utils/storage.ts — lưu / đọc session & settings (AsyncStorage)
- utils/notifications.ts — cấp quyền và quản lý notifications (Expo Notifications)
- utils/stats.ts — hàm trợ giúp cho thống kê và format thời gian
- types/pomodoro.ts — định nghĩa TypeScript cho session / settings
- app.json, tsconfig.json, package.json — cấu hình project

## Cách hoạt động nhanh
- Khi timer hoàn tất: lưu PomodoroSession, gửi notification, bật haptic feedback và chuyển sang chế độ kế tiếp.
- Settings lưu persist bằng AsyncStorage; thay đổi settings khi timer không chạy sẽ cập nhật thời gian hiện tại.
- Thống kê lấy dữ liệu trong 7 ngày gần nhất từ sessions đã lưu.

## Lưu ý phát triển
- Notifications yêu cầu permission của người dùng — kiểm tra hàm setupNotifications trong utils/notifications.ts.
- Trên web một số API (Haptics, KeepAwake, native notifications) không hoạt động.
- Để reset dữ liệu test, xóa AsyncStorage tương ứng hoặc thêm helper trong utils/storage.ts.

## Kiểm thử
- Chạy app trên thiết bị thật để kiểm tra Notifications & Haptics.
- Kiểm tra lưu / đọc session bằng việc hoàn tất một vài phiên và quan sát phần Stats.

## Đóng góp
PR, issue và cải tiến chào đón. Vui lòng tuân theo code style, viết mô tả rõ ràng cho PR.

## License
MIT


