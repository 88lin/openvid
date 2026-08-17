import { cookies } from "next/headers";
import { AuthProvider } from "@/app/contexts/useAuth";
import RecordingOverlay from "../../components/ui/RecordingOverlay";
import { Mockup3dProvider } from "@/app/contexts/Mockup3dContext";
import { RecordingProvider } from "@/app/contexts/RecordingContext";

const THEME_COOKIE = "openvid_theme";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
    // SSR por cookie: el tema efectivo (light|dark, nunca "system") lo escribe
    // UserMenuDropdown. Sin cookie -> dark (look por defecto). Así el primer
    // paint ya coincide con el tema guardado y no hay flash.
    const cookieStore = await cookies();
    const theme = cookieStore.get(THEME_COOKIE)?.value;
    const isDark = theme !== "light";

    return (
        <AuthProvider>
            <RecordingProvider>
                <Mockup3dProvider>
                    <div id="editor-root" className={`min-h-screen bg-background${isDark ? " dark" : ""}`}>
                        {children}
                    </div>
                </Mockup3dProvider>
                <RecordingOverlay />
            </RecordingProvider>
        </AuthProvider>
    );
}
