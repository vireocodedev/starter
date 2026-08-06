package com.vireocode.build;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.gradle.api.GradleException;
import org.gradle.api.provider.Property;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.tasks.TaskAction;

/**
 * Fails when the module's public API and its committed snapshot disagree.
 *
 * <p>
 * The point is not that widening the surface is forbidden — it is that widening
 * it silently is. Updating the snapshot is a one-command, one-file change that
 * lands in the same commit, which puts the "is this a minor or a major?"
 * decision in front of a reviewer at the moment it is being made.
 */
public abstract class ApiSurfaceCheckTask extends AbstractApiSurfaceTask {

    /** Named rather than read from the project: Task.project is off limits at execution time. */
    @Input
    public abstract Property<String> getModuleName();

    @InputFile
    @PathSensitive(PathSensitivity.NONE)
    public abstract RegularFileProperty getBaseline();

    /** Nothing real is produced; this only lets Gradle skip an unchanged check. */
    @OutputFile
    public abstract RegularFileProperty getUpToDateMarker();

    @TaskAction
    public void check() throws IOException {
        Path baseline = getBaseline().get().getAsFile().toPath();
        List<String> actual = renderSurface();
        List<String> expected = Files.readAllLines(baseline, StandardCharsets.UTF_8);

        String actualText = String.join("\n", actual).stripTrailing();
        String expectedText = String.join("\n", expected).stripTrailing();

        if (!actualText.equals(expectedText)) {
            throw new GradleException(report(baseline, expected, actual));
        }

        Files.createDirectories(getUpToDateMarker().get().getAsFile().toPath().getParent());
        Files.writeString(getUpToDateMarker().get().getAsFile().toPath(), "ok\n", StandardCharsets.UTF_8);
    }

    private String report(Path baseline, List<String> expected, List<String> actual) {
        StringBuilder message = new StringBuilder()
                .append("The public API of ").append(getModuleName().get())
                .append(" no longer matches ").append(baseline.getFileName()).append(".\n\n");

        expected.stream().filter(line -> !line.isBlank() && !actual.contains(line))
                .forEach(line -> message.append("  removed: ").append(line.strip()).append('\n'));
        actual.stream().filter(line -> !line.isBlank() && !expected.contains(line))
                .forEach(line -> message.append("  added:   ").append(line.strip()).append('\n'));

        return message
                .append("\nIf this is intended, run ./gradlew apiSurfaceUpdate and commit the result")
                .append(" together with the version bump it justifies.")
                .toString();
    }
}
