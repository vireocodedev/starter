package com.vireocode.build;

import java.util.List;

import org.gradle.api.DefaultTask;
import org.gradle.api.file.ConfigurableFileCollection;
import org.gradle.api.tasks.Classpath;
import org.gradle.api.tasks.InputFiles;

/**
 * Shared plumbing for the two halves of the public-API gate.
 */
public abstract class AbstractApiSurfaceTask extends DefaultTask {

    /** The module's own compiled output. Only types found here are reported. */
    @InputFiles
    public abstract ConfigurableFileCollection getClasses();

    /** Everything the module compiles against, so supertypes resolve. */
    @Classpath
    public abstract ConfigurableFileCollection getClasspath();

    protected final List<String> renderSurface() {
        return ApiSurface.render(getClasses().getFiles(), getClasspath().getFiles());
    }
}
