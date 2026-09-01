export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">เข้าสู่ระบบผู้ดูแล</h1>
      <p className="mb-6 text-sm text-slate-500">
        สำหรับจัดประเภทนวัตกรรมและนำเข้าข้อมูลผลงานเท่านั้น
      </p>
      <form action="/api/admin/login" method="POST" className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/admin/classify"} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
          <input
            type="password"
            name="password"
            autoFocus
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">รหัสผ่านไม่ถูกต้อง</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}
