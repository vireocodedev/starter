package com.vireocode.build;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Renders a module's public API as text, so that widening it has to be an
 * explicit, reviewable act.
 *
 * <p>
 * Reflection rather than a bytecode library, because the question being asked —
 * "what can a consumer see and call?" — is exactly the question reflection
 * answers, and because {@code toGenericString()} already produces a stable,
 * specified rendering of a member including its generic signature. Classes are
 * loaded with {@code initialize = false} and through a loader parented to the
 * platform loader, so nothing in the library runs and nothing leaks into the
 * Gradle daemon's own classpath.
 */
public final class ApiSurface {

    private ApiSurface() {
    }

    /**
     * @param classesDirs the module's own compiled output; only types found
     *                    here are reported, though the whole classpath has to be
     *                    loadable to resolve their supertypes and signatures
     */
    public static List<String> render(Iterable<File> classesDirs, Iterable<File> classpath) {
        List<URL> urls = new ArrayList<>();
        classesDirs.forEach(dir -> urls.add(toUrl(dir)));
        classpath.forEach(entry -> urls.add(toUrl(entry)));

        try (URLClassLoader loader = new URLClassLoader(
                urls.toArray(URL[]::new), ClassLoader.getPlatformClassLoader())) {

            List<Class<?>> types = new ArrayList<>();
            for (File dir : classesDirs) {
                types.addAll(publicTypesIn(dir, loader));
            }
            types.sort(Comparator.comparing(Class::getName));

            List<String> lines = new ArrayList<>();
            for (Class<?> type : types) {
                describe(type, lines);
            }
            return lines;
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    private static List<Class<?>> publicTypesIn(File classesDir, ClassLoader loader) {
        Path root = classesDir.toPath();
        if (!Files.isDirectory(root)) {
            return List.of();
        }

        try (Stream<Path> files = Files.walk(root)) {
            return files
                    .filter(path -> path.toString().endsWith(".class"))
                    .map(path -> binaryName(root, path))
                    .filter(name -> !name.endsWith("package-info") && !name.equals("module-info"))
                    .map(name -> load(name, loader))
                    .filter(ApiSurface::isVisibleToConsumers)
                    .collect(Collectors.toCollection(ArrayList::new));
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    private static String binaryName(Path root, Path classFile) {
        String relative = root.relativize(classFile).toString();
        return relative
                .substring(0, relative.length() - ".class".length())
                .replace(File.separatorChar, '.');
    }

    private static Class<?> load(String binaryName, ClassLoader loader) {
        try {
            return Class.forName(binaryName, false, loader);
        } catch (ClassNotFoundException | NoClassDefFoundError ex) {
            throw new IllegalStateException("Could not load " + binaryName + " while rendering the API surface", ex);
        }
    }

    /**
     * Anonymous, local and synthetic classes are excluded even when the compiler
     * marks them public: a consumer has no name to reach them by.
     */
    private static boolean isVisibleToConsumers(Class<?> type) {
        if (type.isSynthetic() || type.isAnonymousClass() || type.isLocalClass()) {
            return false;
        }
        for (Class<?> current = type; current != null; current = current.getEnclosingClass()) {
            int modifiers = current.getModifiers();
            if (!Modifier.isPublic(modifiers) && !Modifier.isProtected(modifiers)) {
                return false;
            }
        }
        return true;
    }

    private static void describe(Class<?> type, List<String> lines) {
        lines.add(type.toGenericString());

        Type superclass = type.getGenericSuperclass();
        if (superclass != null && superclass != Object.class) {
            lines.add("    extends " + superclass.getTypeName());
        }
        Arrays.stream(type.getGenericInterfaces())
                .map(Type::getTypeName)
                .sorted()
                .forEach(name -> lines.add("    implements " + name));

        members(type.getDeclaredConstructors(), constructor -> false, Constructor::toGenericString, lines);
        members(type.getDeclaredFields(), field -> false, Field::toGenericString, lines);
        // Bridge methods are the compiler's own covariant-override plumbing, not
        // anything a consumer writes against.
        members(type.getDeclaredMethods(), Method::isBridge, Method::toGenericString, lines);

        lines.add("");
    }

    private static <M extends Member> void members(M[] declared, Predicate<M> alsoExclude,
            Function<M, String> render, List<String> lines) {

        Arrays.stream(declared)
                .filter(member -> !member.isSynthetic())
                .filter(member -> !alsoExclude.test(member))
                .filter(member -> Modifier.isPublic(member.getModifiers())
                        || Modifier.isProtected(member.getModifiers()))
                .map(render)
                // getDeclaredX order is unspecified and varies between JDK runs,
                // so the snapshot has to impose one or it will churn on its own.
                .sorted()
                .forEach(signature -> lines.add("    " + signature));
    }

    private static URL toUrl(File file) {
        try {
            return file.toURI().toURL();
        } catch (MalformedURLException ex) {
            throw new IllegalStateException("Not a usable classpath entry: " + file, ex);
        }
    }
}
