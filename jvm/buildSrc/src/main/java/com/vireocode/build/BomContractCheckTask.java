package com.vireocode.build;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.gradle.api.DefaultTask;
import org.gradle.api.GradleException;
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.provider.ListProperty;
import org.gradle.api.provider.Property;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskAction;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 * Verifies both the Gradle platform model and its generated Maven BOM.
 *
 * <p>The BOM has no classes, so a bytecode API snapshot cannot protect it. Its
 * public API is the exact set of aligned coordinates instead.</p>
 */
@CacheableTask
public abstract class BomContractCheckTask extends DefaultTask {

    /** The BOM's own {@code group:artifact:version}. */
    @Input
    public abstract Property<String> getBomCoordinate();

    /** The module coordinates that the published platform must align. */
    @Input
    public abstract ListProperty<String> getExpectedModuleCoordinates();

    /** The module constraints currently declared in Gradle's API model. */
    @Input
    public abstract ListProperty<String> getActualModuleCoordinates();

    /** The imported upstream platform coordinate. */
    @Input
    public abstract Property<String> getExpectedPlatformCoordinate();

    /** The upstream platform currently declared in Gradle's API model. */
    @Input
    public abstract Property<String> getActualPlatformCoordinate();

    /** Maven's generated consumer descriptor. */
    @InputFile
    @PathSensitive(PathSensitivity.NONE)
    public abstract RegularFileProperty getPomFile();

    /** Marker used only for Gradle's incremental and build-cache semantics. */
    @OutputFile
    public abstract RegularFileProperty getUpToDateMarker();

    @TaskAction
    public void check() throws IOException {
        List<String> expectedModules = sorted(getExpectedModuleCoordinates().get());
        List<String> actualModules = sorted(getActualModuleCoordinates().get());
        if (!actualModules.equals(expectedModules)) {
            throw new GradleException("The BOM's Gradle constraints drifted. Expected "
                    + expectedModules + " but found " + actualModules + '.');
        }

        String expectedPlatform = getExpectedPlatformCoordinate().get();
        if (!getActualPlatformCoordinate().get().equals(expectedPlatform)) {
            throw new GradleException("The BOM's imported Gradle platform drifted. Expected "
                    + expectedPlatform + " but found " + getActualPlatformCoordinate().get() + '.');
        }

        verifyPom(expectedModules, expectedPlatform);

        Path marker = getUpToDateMarker().get().getAsFile().toPath();
        Files.createDirectories(marker.getParent());
        Files.writeString(marker, "ok\n", StandardCharsets.UTF_8);
    }

    private void verifyPom(List<String> expectedModules, String expectedPlatform) throws IOException {
        Document document = parsePom(getPomFile().get().getAsFile().toPath());
        Element project = document.getDocumentElement();

        String actualBom = String.join(":",
                directChildText(project, "groupId"),
                directChildText(project, "artifactId"),
                directChildText(project, "version"));
        if (!actualBom.equals(getBomCoordinate().get())) {
            throw new GradleException("Generated Maven BOM coordinate drifted. Expected "
                    + getBomCoordinate().get() + " but found " + actualBom + '.');
        }
        if (!"pom".equals(directChildText(project, "packaging"))) {
            throw new GradleException("Generated Maven BOM must use <packaging>pom</packaging>.");
        }

        List<String> modules = new ArrayList<>();
        List<String> importedPlatforms = new ArrayList<>();
        NodeList dependencies = document.getElementsByTagName("dependency");
        for (int index = 0; index < dependencies.getLength(); index++) {
            Element dependency = (Element) dependencies.item(index);
            String coordinate = String.join(":",
                    directChildText(dependency, "groupId"),
                    directChildText(dependency, "artifactId"),
                    directChildText(dependency, "version"));
            String type = directChildText(dependency, "type");
            String scope = directChildText(dependency, "scope");
            if ("pom".equals(type) && "import".equals(scope)) {
                importedPlatforms.add(coordinate);
            } else if (type.isEmpty() && scope.isEmpty()) {
                modules.add(coordinate);
            } else {
                throw new GradleException("Generated Maven BOM contains an unexpected dependency shape: "
                        + coordinate + " type=" + type + " scope=" + scope + '.');
            }
        }

        if (!sorted(modules).equals(expectedModules)) {
            throw new GradleException("Generated Maven BOM constraints drifted. Expected "
                    + expectedModules + " but found " + sorted(modules) + '.');
        }
        if (!importedPlatforms.equals(List.of(expectedPlatform))) {
            throw new GradleException("Generated Maven BOM imports drifted. Expected ["
                    + expectedPlatform + "] but found " + importedPlatforms + '.');
        }
    }

    private static Document parsePom(Path pom) throws IOException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
            return factory.newDocumentBuilder().parse(pom.toFile());
        } catch (ParserConfigurationException | SAXException ex) {
            throw new GradleException("Could not parse generated Maven BOM " + pom + '.', ex);
        }
    }

    private static String directChildText(Element parent, String name) {
        NodeList children = parent.getChildNodes();
        for (int index = 0; index < children.getLength(); index++) {
            Node child = children.item(index);
            if (child instanceof Element element && name.equals(element.getTagName())) {
                return element.getTextContent().strip();
            }
        }
        return "";
    }

    private static List<String> sorted(List<String> coordinates) {
        return coordinates.stream().sorted(Comparator.naturalOrder()).toList();
    }
}
